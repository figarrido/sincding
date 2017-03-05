# Sincding

Sincding allows you to download the files from uc siding in an easy way

Install with
```
npm install -g sincding
```

And then just run
```
sincding
```

On the first run you will be prompted for credentials
```json
{
  "username": "Your uc username without @uc",
  "password": "Your uc password",
  "path": "The absolute path to the folder where you want to download the siding folders and files",
  "ignore": "Space separated acronyms of courses you don't want to download. Usefull for those who are assistants. (example: IIC2154 IIC1103)"
}
```
The credentials are stored in your Home directory on `.sincding/data.json`