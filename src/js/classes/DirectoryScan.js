import Util from './Util';
import uuid from 'uuid/v4';

export function fileDragDrop(e/*, parent*/) {    
    return new Promise((res, rej) => {
        const result = [];
        const dataTransfer = e.dataTransfer;
        const files = e.target.files || (dataTransfer && dataTransfer.files);
        if (!files || files.length == 0) {
            res(res);
        }
        const ua = Util.userAgent();
        if (ua === 'chrome' 
                && e.dataTransfer
                && e.dataTransfer.items
                && e.dataTransfer.items.length > 0 && e.dataTransfer.items[0].webkitGetAsEntry) {
            const items = e.dataTransfer.items;
            for (let i = 0, len = items.length; i < len; i++) {
                if (items[i].webkitGetAsEntry) {
                    const item = items[i].webkitGetAsEntry();
                    if (item) {
                        traverseFileTree(item, {
                            children: result,
                        });
                    }
                }
            }
        } else if (ua === 'firefox' && e.dataTransfer) {
            try {
                for (let i = 0, m = e.dataTransfer.mozItemCount; i < m; ++i) {
                    const file = e.dataTransfer.mozGetDataAt("application/x-moz-file", i);
                    if (file instanceof Ci.nsIFile) {
                        traverseFileTree(new mozDirtyGetAsEntry(file), {
                            children: result,
                        });
                    }
                    else {
                        console.log('dd.fileDragDrop: Not a nsIFile', file);
                    }
                }
            }
            catch (e) {
                console.warn(e.getMessage());
            }
        } else if (ua === 'safari' && e.dataTransfer ) {
            // same as for chrome, but replace webkitGetAsEntry with getAsEntry
            // I think
            const items = e.dataTransfer.items;
            for (let i = 0; i < items.length; i++) {
                if (items[i].getAsEntry) {
                    const item = items[i].getAsEntry();
                    if (item) {
                        traverseFileTree(item, {
                            children: result,
                        });
                    }
                }
            }
        } else {
            console.log("Got files from file or folder input");
            const filesList = [];
            for (let i = 0, file; file = files[i]; i++) {
                if (file.webkitRelativePath) {
                    file.path = String(file.webkitRelativePath).replace(RegExp("[\\/]" + String(file.name).replace(/([^\w])/g,'\\$1') + "$"), '') + "/";
                } else {
                    file.path = '';
                }
                filesList.push(file);
            }
            //console.table(filesList);
            buildFileTree(filesList, result);

            //reset the inputs
            /*var c = $('#dd-file-upload');
            c.replaceWith(c = c.clone(true));
            var c = $('#dd-folder-upload');
            c.replaceWith(c = c.clone(true));  */  
        }
        let timeout = setTimeout(function() {
            res(result);
        }, 300)
    });
}

class PWNode {
    constructor() {
        this.children = new Map();
    }
    getChild(name) {
        if (this.children.has(name)) return this.children.get(name);
        const res = new PWNode();
        this.children.add(name, res);
        return res;
    }
    getChildren() {
        return this.children;
    }
    setParent(parent) {
        this.parent = parent;
    }
    setFile(file) {
        this.file = file;
    }
    get folder() {
        return !this.file;
    }
}

class PathWalker {
    constructor() {
        this.root = new PWNode();
    }
    addPath(file) {
        const names = file.path.split(/[\\\/]/);
        let node = this.root;
        for (const name of names) {
            node = node.getChild(name);
        }
        node.setFile(file);
    }
    getRoot() {
        return this.root;
    }
}
/* the file inputs need this because they dont fire the same events that drop does */
function buildFileTree(items, parent) {
    //console.table(items);
    const pw = new PathWalker();
    for (let i = 0; i < items.length; i++) {
        const file = items[i];
        pw.addPath(file);
       /* const path = file.path;
        if (path == '' && !_.contains(dd.ignoredFiles, file.name)) {
            //console.log("%cfound file to add: " + file.name + ", adding to " + parent.name, "color: green;");
            if (file.size > fm.uploadSizeLimit) {
                parent.addChild(new ChunkedFile(posInQueue, file, file.name, path, parent));
            } else {
                parent.addChild(new SmallFile(posInQueue, file, file.name, path, parent));
            }
            queue.triggerStart(posInQueue);
            //folderNamesSeen.push('');
        } else {
            folderNamesSeen.push(path.split(/\//)[0]);
            //folders.push(file);
        }*/
    }
    /*folderNamesSeen = _.uniq(folderNamesSeen);
    for (var i = 0; i < folderNamesSeen.length; i++) {
        folders.push([]);
        for (var j = 0; j < items.length; j++) {
            if (folderNamesSeen[i] == items[j].path.split(/\//)[0]) {
                //console.log(items[j].path);
                var oPath = items[j].path;
                var path = items[j].path.split(/\//);
                var parentName = path.shift();
                path = path.toString().replace(/,/g, '/');
                items[j].path = path;
                if (!_.contains(foldersAdded, parentName)) {
                    var newFolder = new Folder(posInQueue, parentName, oPath, parent, false);
                    parent.addChild(newFolder);
                    parents.push(newFolder);
                    foldersAdded.push(parentName);
                }
                folders[i].push(items[j]);
            }
        }
    }
    for (var i = 0; i < folders.length; i++) {
        buildFileTree(posInQueue, folders[i], parents[i]);
    }*/
}

function item2file(item, parent) {
    if (item.isFile) {
        item.file(file => {
            const node = {
                uuid: uuid(),
                file,
                parent,
                name: file.name,
            };
            parent.children.push(node);
        });
    } else throw new Error('item is not a file');
}
function item2dir(item, parent) {
    if (!item.isDirectory) throw new Error('item is not a directory');
    const dirReader = item.createReader();
    const newFolder = {
        uuid: uuid(),
        file: false,
        parent,
        name: item.name,
        children: [],
    }
    parent.children.push(newFolder);
    function readEntries() {
        dirReader.readEntries(function(entries) {
            //console.log("%cfound folder to add: " + item.name + ", adding to " + parent.name, "color: orange;");
            for (let i = 0; i < entries.length; i++) {
                traverseFileTree(entries[i], newFolder);
            }
            if (!entries.length) {
                return;
            } else {
                readEntries();
            }
        });
    }
    readEntries();
}
/*
@param item     the file item
@param parent   the folder object, or the string hash of the root folder
@param path     the path of the file item
*/
function traverseFileTree(item, parent) {
    let result;
    if (item.isFile) {
        item2file(item, parent);
    } else if (item.isDirectory) {
        item2dir(item, parent);
    }
    return parent;
}
