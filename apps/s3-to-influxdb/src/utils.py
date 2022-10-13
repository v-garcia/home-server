import functools
import yaml
import jmespath
import re
import os


def apply_fns(fns, v):
    return functools.reduce(lambda a, b: b(a), fns, v)


def load_yaml(path):
    with open(path, "r") as stream:
        return yaml.safe_load(stream)

def substitute(str, env=os.environ, **args):
    return re.sub(r"\{(.+?)\}", lambda x: jmespath.search(x.group().strip(r"{|}"), {"env": env, **args}), str)
