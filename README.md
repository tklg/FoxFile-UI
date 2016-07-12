# FoxFile
An online file manager, because it sounded like a good project.  

### TODO:
- replace "group password" with recaptcha
- add decryption/download progress bars to the file manager and the file share page
- make pretty email templates
- optimize display and scrolling of long lists of files (infinite scroll)
- encrypt file names long with the files
- random salt for hashids with each install
- encourage backing up master key on account creation
- make account key generation async; dont bother generating the RSA key pair as its not used
- fix login history and auth key checking so expired keys cannot be renewed
- add pausing/canceling of uploads and downloads
- if a file/folder is moved to the trash while it is open, close the open bar(s)
- fix status text colors on downloads page in night mode
- make help articles
