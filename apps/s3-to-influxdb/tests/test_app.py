import unittest
import sys
import app


class TestSimple(unittest.TestCase):

    def __init__(self, *args, **kwargs):
        self.maxDiff = None
        super(TestSimple, self).__init__(*args, **kwargs)

    def test_parse_field(self):
        self.assertEqual(["myk", 13], app.parse_field(
            {"k": {"ki": "13"}}, {"path": "k.ki", "name": "myk", "fns": ["int"]}))

    def test_parse_field_not_exists(self):
        self.assertEqual(None, app.parse_field(
            ["e", 5], {"path": "k.ki", "name": "myk"}))
        self.assertEqual(None, app.parse_field(
            {}, {"path": "k.ki", "name": "myk", "fns": ["int"]}))

    def test_parse_record_enedis(self):
        self.assertEqual(
            {"bucket": "my-bucket",
             "measurement": "enedis_daily",
             "time": "2022-09-19",
             "tags": {'unit': 'Wh', 'usagePointId': '1254'},
             "fields": {"consumption": 5343}},
            app.parse_record(
                {"bucket": "my-bucket",
                 "measurement": "enedis_daily",
                 "time": {"path": "day"},
                 "tags": [{"path": "unit", "name": "unit"},
                          {"path": "usagePointId", "name": "usagePointId"}],
                 "fields": [{"path": "value", "name": "consumption"}]},
                {'unit': 'Wh', 'value': 5343, 'usagePointId': '1254', 'day': '2022-09-19',
                 'request': {'Bucket': 'enedis-bucket', 'Key': '123/daily_consumption/20220919.json'}}
            ))

    def test_parse_record_bank(self):
        self.assertEqual({"bucket": "my-bucket",
                          "measurement": "bank-daily",
                          "time": "2022-09-14",
                          "tags": {'accountLabel': 'CHOUCROUTE BANQUE (joint)',
                                   'accountNum': '11111111111',
                                   'category': 'Alimentation',
                                   'categoryParent': 'Vie quotidienne',
                                   'comment': '',
                                   'label': 'CARTE 11/09/22 CACAO FAGES CB*8888'},
                          "fields": {'accountBalance': 344.33, 'amount': -13.5}},
                         app.parse_record(
                             {"bucket": "my-bucket",
                              "measurement": "bank-daily",
                              "time": {"path": "dateOp"},
                                 "tags": [{"path": "label", "name": "label"},
                                          {"path": "category", "name": "category"},
                                          {"path": "categoryParent",
                                              "name": "categoryParent"},
                                          {"path": "comment", "name": "comment"},
                                          {"path": "accountNum",
                                              "name": "accountNum"},
                                          {"path": "accountLabel", "name": "accountLabel"}],
                                 "fields": [{"path": "amount", "name": "amount", "fns": ["float"]},
                                            {"path": "accountBalance", "name": "accountBalance", "fns": ["float"]}]},
                             {'dateOp': '2022-09-14', 'dateVal': '2022-09-14', 'label': 'CARTE 11/09/22 CACAO FAGES CB*8888',
                                 'category': 'Alimentation', 'categoryParent': 'Vie quotidienne', 'comment': '', 'accountNum': '11111111111',
                                 'accountLabel': 'CHOUCROUTE BANQUE (joint)', 'amount': '-13.5', 'accountBalance': '344.33',
                                 'request': {'Bucket': 'boursorama-tracker', 'Key': 'movements/1163b7f991e64d05a25adbf69d18bb3e/20220914.csv'}}))

    def test_tag_duplicate(self):
        self.assertEqual([{'tags': {'a': 1, 'b': 2}, 'value': 1, 'time': 3},
                          {'tags': {'a': 1, 'b': 2}, 'value': 1, 'time': 4},
                          {'tags': {'a': 1, 'b': 2, 'uniq': 1}, 'value': 2, 'time': 3}],
                         list(app.tag_duplicate_datapoints(
                             [{"tags": {"a": 1, "b": 2}, "value": 1, "time": 3},
                              {"tags": {"a": 1, "b": 2}, "value": 1, "time": 4},
                              {"tags": {"a": 1, "b": 2}, "value": 2, "time": 3}])))
