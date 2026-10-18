"""Self-contained direct-model regression suite. Not full GenVM/consensus verification."""
import importlib.util
import json
import sys
import types
import unittest
from pathlib import Path

ROOT = Path(__file__).parent
CURRENT = ['0x' + 'a'*40]
TIMESTAMP = [2_000_000_000]
PROMPTS = []
MODEL = [{}]

class Return:
    def __init__(self, calldata): self.calldata=calldata

class StubContract:
    def __new__(cls, *args, **kwargs):
        obj = object.__new__(cls)
        obj.cases={}; obj.histories={}; obj.case_ids=[]
        return obj

class UError(Exception): pass

def exec_prompt(prompt, response_format=None):
    PROMPTS.append(prompt)
    return MODEL[0]

def nondet(leader, validator):
    result=leader()
    if not validator(Return(result)):
        raise UError('CONSENSUS_REJECTED')
    return result

sdk=types.ModuleType('genlayer')
gl=types.SimpleNamespace(
    Contract=StubContract, message=types.SimpleNamespace(sender_address=types.SimpleNamespace(as_hex='')),
    vm=types.SimpleNamespace(UserError=UError, Return=Return, run_nondet_unsafe=nondet),
    nondet=types.SimpleNamespace(exec_prompt=exec_prompt),
    public=types.SimpleNamespace(view=lambda fn:fn,write=lambda fn:fn))
sdk.gl=gl;sdk.TreeMap=dict;sdk.DynArray=list
sys.modules['genlayer']=sdk

class ContractTest(unittest.TestCase):
    def setUp(self):
        self.modules={}
        self.models={'noticeclock': {'breach_identified':True,'clause_applicable':True,'requested_cure_clear':True,'evidence_sufficient':True},
                     'invoicebasis':{'in_eligible_class':True,'exclusion_applies':False,'evidence_sufficient':True},
                     'parcelcourt':{'handoff_matches_promise':True,'authorized_recipient_supported':True,'evidence_sufficient':True},
                     'shiftfair':{'supervisor_authorized':True,'attendance_matches_shift':True,'evidence_sufficient':True}}
        self.names={'noticeclock':'NoticeClock','invoicebasis':'InvoiceBasis','parcelcourt':'ParcelCourt','shiftfair':'ShiftFair'}
        for slug in self.names:
            spec=importlib.util.spec_from_file_location('test_'+slug,ROOT/slug/'contracts'/(slug+'.py'))
            mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
            mod._now=lambda:TIMESTAMP[0]
            self.modules[slug]=mod

    def actor(self,address):gl.message.sender_address.as_hex=address
    def case(self,slug):
        self.actor('0x'+'a'*40)
        mod=self.modules[slug]
        obj=getattr(mod,self.names[slug])()
        args=['CASE-1','0x'+'b'*40,'FROZEN AGREEMENT: entitlement requires documented criteria and consent.',TIMESTAMP[0]+3600]
        if slug=='invoicebasis':args.extend([999,1,3])
        if slug=='shiftfair':args.extend([120,90])
        obj.create_case(*args)
        return obj,mod

    def prepare(self,slug):
        obj,mod=self.case(slug)
        self.actor('0x'+'b'*40);obj.consent('CASE-1')
        self.actor('0x'+'a'*40);obj.freeze('CASE-1')
        obj.submit_evidence('CASE-1','Frozen policy and two-party supporting evidence, signed by the submitting actor.')
        MODEL[0]=self.models[slug]
        PROMPTS.clear()
        return obj,mod

    def test_create_and_consent_authorization(self):
        for slug in self.names:
            with self.subTest(slug=slug):
                obj,_=self.case(slug)
                with self.assertRaises(UError):obj.freeze('CASE-1')
                self.actor('0x'+'c'*40)
                with self.assertRaises(UError):obj.consent('CASE-1')
                self.actor('0x'+'b'*40);obj.consent('CASE-1')
                self.actor('0x'+'a'*40);obj.freeze('CASE-1')
                self.assertEqual(json.loads(obj.get_case('CASE-1'))['status'],'FROZEN')

    def test_pinned_runner(self):
        for slug in self.names:
            with self.subTest(slug=slug):
                src=(ROOT/slug/'contracts'/(slug+'.py')).read_text()
                self.assertTrue(src.startswith('# { "Depends": "py-genlayer:1jb45'))
                self.assertNotIn('py-genlayer:test',src)
                self.assertIn('run_nondet_unsafe',src)

    def test_consent_requires_distinct_parties(self):
        for slug in self.names:
            with self.subTest(slug=slug):
                obj,mod=self.case(slug)
                self.actor('0x'+'a'*40)
                with self.assertRaises(UError): obj.create_case('CASE-1','0x'+'b'*40,'Agreement',TIMESTAMP[0]+3600,*([10,1,2] if slug=='invoicebasis' else [10,20] if slug=='shiftfair' else []))

    def test_bounded_semantics_and_frozen_evidence(self):
        for slug in self.names:
            with self.subTest(slug=slug):
                obj,mod=self.prepare(slug)
                with self.assertRaises(UError):obj.submit_evidence('CASE-1','replay')
                self.actor('0x'+'c'*40)
                with self.assertRaises(UError):obj.adjudicate('CASE-1')
                self.actor('0x'+'a'*40)
                verdict=obj.adjudicate('CASE-1')
                self.assertTrue(verdict in ('READY','ELIGIBLE','SUPPORTED_DELIVERY','APPROVED'))
                self.assertEqual(len(PROMPTS),2,'validator must independently rerun model')
                case=json.loads(obj.get_case('CASE-1'))
                self.assertEqual(case['status'],'ASSESSED')
                self.assertEqual(len(json.loads(obj.get_history('CASE-1'))),1)
                if slug=='invoicebasis':self.assertEqual(case['payable_minor'],333)
                if slug=='shiftfair':self.assertEqual(case['approved_minutes'],90)
                with self.assertRaises(UError):obj.adjudicate('CASE-1')

    def test_insufficient_evidence_fails_closed(self):
        for slug in self.names:
            with self.subTest(slug=slug):
                obj,_=self.prepare(slug)
                MODEL[0]={**self.models[slug],'evidence_sufficient':False}
                self.assertIn(obj.adjudicate('CASE-1'),('REVIEW_REQUIRED','INCONCLUSIVE','UNRESOLVED'))

    def test_wrong_boolean_type_refused(self):
        for slug in self.names:
            with self.subTest(slug=slug):
                obj,_=self.prepare(slug)
                MODEL[0]={**self.models[slug],'evidence_sufficient':'true'}
                with self.assertRaises(UError):obj.adjudicate('CASE-1')
                self.assertEqual(json.loads(obj.get_case('CASE-1'))['status'],'EVIDENCE_LOCKED')

    def test_challenge_and_audit_lineage(self):
        for slug in self.names:
            with self.subTest(slug=slug):
                obj,_=self.prepare(slug)
                obj.adjudicate('CASE-1')
                obj.challenge('CASE-1','The evidence lacks the written authorisation')
                TIMESTAMP[0]+=11
                obj.adjudicate('CASE-1')
                rows=json.loads(obj.get_history('CASE-1'))
                self.assertEqual(len(rows),2)
                self.assertEqual(rows[1]['prev'],rows[0]['entry_hash'])
                with self.assertRaises(UError):obj.challenge('CASE-1','challenge three')
                TIMESTAMP[0]-=11

    def test_deadline_and_input_bounds(self):
        for slug in self.names:
            with self.subTest(slug=slug):
                self.actor('0x'+'a'*40)
                obj=getattr(self.modules[slug],self.names[slug])()
                args=['expired','0x'+'b'*40,'terms',TIMESTAMP[0]-1]
                if slug=='invoicebasis':args.extend([1,1,2])
                if slug=='shiftfair':args.extend([10,20])
                with self.assertRaises(UError):obj.create_case(*args)
                args[0]='valid';args[3]=TIMESTAMP[0]+3600;args[2]='x'*2049
                with self.assertRaises(UError):obj.create_case(*args)

    def test_financial_and_minute_constraints(self):
        for slug in ('invoicebasis','shiftfair'):
            with self.subTest(slug=slug):
                self.actor('0x'+'a'*40)
                obj=getattr(self.modules[slug],self.names[slug])()
                args=['negative','0x'+'b'*40,'terms',TIMESTAMP[0]+3600]
                args.extend([-1,1,2] if slug=='invoicebasis' else [-1,20])
                with self.assertRaises(UError):obj.create_case(*args)

if __name__=='__main__':unittest.main(verbosity=2)