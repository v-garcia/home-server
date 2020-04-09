#!/usr/bin/env python
import subprocess
import sys
import os
import urllib.request
import json
import time
from datetime import timedelta

### common functions

def send_notification ( title, message):
    gotify_url=os.getenv("GOTIFY_URL")
    gotify_token=os.getenv("GOTIFY_TOKEN")
    data=json.dumps({"title":title, "message":message}).encode('utf8')
    req = urllib.request.Request(f'{gotify_url}/message', data=data,
                             headers={'content-type': 'application/json',
                                      'X-Gotify-Key': gotify_token})
    return urllib.request.urlopen(req)

### common-info
hostname = os.uname()[1]

# that's my very first script in python

print(f"Running rclone-perso on {hostname}")
start_time = time.monotonic()

WORKING_DIR="/root/rclonesyncwd/"

# print args
args=sys.argv[1:]
print(args)

# get config path
configIdx=args.index('--config')
configPath=args[configIdx+1]

# print config info
subprocess.run(["rclone", "config", "--config", configPath, "file"])

# check if distant remotes exists
remoteDir=args[-1]
fileToCheck=remoteDir+'RCLONE_TEST'
subprocess.run(["rclone", "lsf", "--config", configPath, fileToCheck], check=True)

# check if working dir is empty
isSyncwdEmpty = not (os.path.isdir(WORKING_DIR) and os.listdir(WORKING_DIR))

if isSyncwdEmpty :
  print(f"Sync working dir is empty at {WORKING_DIR}")

# check if local dir is empty
localDir=args[-2]
isLocalDirEmpty = not (os.path.isdir(localDir) and os.listdir(localDir))

if isLocalDirEmpty :
  print(f"Local sync dir is empty ({localDir})")

# append first-sync if necessary
customParams = ["--first-sync"] if (isLocalDirEmpty or isSyncwdEmpty) else ["--check-access"]

# run rclonesync
finalArgs= ["rclonesync"] + customParams + args
print("Executing rclonesync with: ", finalArgs)
sys.stdout.flush()

p = subprocess.run(finalArgs, timeout=(3*60*60))
#os.execv("/usr/bin/rclonesync", finalArgs)

end_time = time.monotonic()
delta = timedelta(seconds=end_time - start_time)

if p.returncode != 0:
    print('Sending error notification')
    send_notification('Error on rclone sync', f'Process exited with return code {p.returncode} on {hostname}')
    os._exit(p.returncode)
else:
    print(f'Sync operation was sucessfull in {str(delta)}')
