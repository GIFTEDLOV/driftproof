"""Small deterministic GenLayer surface for contract-unit tests.

The real SDK is loaded by genvm-lint. These doubles keep direct/adversarial
tests offline and ensure no network or chain writes occur during pytest.
"""

from __future__ import annotations

import sys
import types


class FakeMap(dict):
    pass


class FakeArray(list):
    pass


class FakeSender:
    as_hex = "0x1111111111111111111111111111111111111111"


class FakeResponse:
    def __init__(self, status: int = 200, body: bytes = b"", url: str | None = None, headers=None):
        self.status = status
        self.body = body
        self.url = url
        self.headers = {} if headers is None else headers


class FakeContract:
    def __new__(cls, *args, **kwargs):
        instance = super().__new__(cls)
        annotations = {}
        for base in reversed(cls.__mro__):
            annotations.update(getattr(base, "__annotations__", {}))
        for name, annotation in annotations.items():
            if name.endswith("count"):
                continue
            if name.endswith("_ids"):
                setattr(instance, name, FakeArray())
            else:
                setattr(instance, name, FakeMap())
        return instance


def _public(kind):
    def decorate(function):
        function.__gl_public__ = True
        function.__gl_readonly__ = kind == "view"
        return function

    return decorate


fake = types.ModuleType("genlayer")
fake.u256 = int
fake.u64 = int
fake.u32 = int
fake.u8 = int
fake.Contract = FakeContract
fake.contract = types.SimpleNamespace(Contract=FakeContract)
fake.storage = types.SimpleNamespace(TreeMap=FakeMap, DynArray=FakeArray)
fake.public = types.SimpleNamespace(write=_public("write"), view=_public("view"))
fake.message = types.SimpleNamespace(
    raw={"datetime": "2026-10-01T00:00:00Z"}, sender_address=FakeSender()
)
fake_test_hooks = types.SimpleNamespace(web_get=None, prompt=None)


class UserError(Exception):
    pass


class Return:
    def __init__(self, calldata):
        self.calldata = calldata


def run_nondet(leader, validator):
    result = leader()
    if not validator(Return(result)):
        raise UserError("CONSENSUS_REJECTED")
    return result


def web_get(url, **kwargs):
    if fake_test_hooks.web_get is None:
        raise OSError("no test web fixture")
    return fake_test_hooks.web_get(url, **kwargs)


def exec_prompt(prompt, response_format="json"):
    if fake_test_hooks.prompt is None:
        raise OSError("no test prompt fixture")
    return fake_test_hooks.prompt(prompt, response_format)


fake.vm = types.SimpleNamespace(UserError=UserError, Return=Return, run_nondet=run_nondet)
fake.nondet = types.SimpleNamespace(
    web=types.SimpleNamespace(get=web_get), exec_prompt=exec_prompt
)
sys.modules.setdefault("genlayer", fake)
