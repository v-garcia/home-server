#!/usr/bin/env python
import subprocess
import sys
import os


print("Running custom python script")

# that's my very first script in python
WORKING_DIR="/root/.rclonesyncwd/"

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
#subprocess.run(finalArgs, check=True)
os.execv("/usr/bin/rclonesync", finalArgs)

