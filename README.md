# Deployer #

## How it works? ##

 1. Run ```git pull``` command in ```dirtyPath```
 2. Run ```npm install``` command in ```dirtyPath```
 3. Run ```stopCommand``` command in ```prodPath```
 4. Remove ```prodPath```
 5. Copy ```dirtyPath``` to ```prodPath```
 6. Run ```startCommand``` in ```prodPath```

## How to config? ##
```json
{
	"port": 6735,
	"dirtyPath": "/home/ec2-user/project-dirty",
	"prodPath": "/home/ec2-user/project",
	"stopCommand": "./stop.sh",
	"startCommand": "./start.sh"
}
```
