#!/usr/bin/env python

import subprocess   

oss = subprocess.run(["df", "-H"])
print(oss.returncode)