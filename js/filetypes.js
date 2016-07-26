var ext = {};
var extensions = {
    'threed': [['3ds', '3dm', 'max', 'obj'], '3D', 'mdi-file-outline'],
    'aftereffects': [['aep', 'aet'], 'Adobe Aftereffects', 'mdi-file-outline'],
    'audio': [['mp3', 'wav', '3ga', 'aif', 'aiff', 'flac', 'iff', 'm4a', 'wma'], 'Audio', 'mdi-file-music'],
    'cad': [['dxf', 'dwg'], 'CAD', 'mdi-file-outline'],
    'compressed': [['zip', 'rar', 'tgz', 'gz', 'bz2', 'tbz', 'tar', '7z', 'sitx'], 'Compressed', 'mdi-zip-box'],
    'database': [['sql', 'accdb', 'db', 'dbf', 'mdb', 'pdb'], 'Database', 'mdi-database'],
    'dreamweaver': [['dwt'], 'Database', 'mdi-database'],
    'excel': [['xls', 'xlsx', 'xlt', 'xltm'], 'Excel', 'mdi-file-excel'],
    'executable': [['exe', 'com', 'bin', 'apk', 'app', 'msi', 'cmd', 'gadget'], 'Executable', 'mdi-file-outline'],
    'fla-lang': [['as', 'ascs', 'asc'], 'ActionScript', 'mdi-code-tags'],
    'flash': [['fla'], 'Flash', 'mdi-file-video'],
    'font': [['fnt', 'otf', 'ttf', 'fon'], 'Font', 'mdi-format-text'],
    'generic': [['*'], 'File', 'mdi-file-outline'],
    'gis': [['gpx', 'kml', 'kmz'], 'GPS File', 'mdi-file-outline'],
    'graphic': [['gif', 'tiff', 'tif', 'bmp', 'png', 'tga'], 'Image', 'mdi-file-image'],
    'html': [['html', 'htm', 'dhtml', 'xhtml'], 'HTML', 'mdi-code-tags'],
    'illustrator': [['ai', 'ait'], 'Adobe Illustrator', 'mdi-file-outline'],
    'image': [['jpg', 'jpeg'], 'Image', 'mdi-file-image'],
    'indesign': [['indd'], 'Adobe InDesign', 'mdi-file-outline'],
    'java': [['jar', 'java', 'class'], 'Java', 'mdi-code-tags'],
    'midi': [['mid', 'midi'], 'Midi', 'mdi-file-music'],
    'pdf': [['pdf'], 'PDF', 'mdi-file-pdf'],
    'photoshop': [['abr', 'psb', 'psd'], 'Adobe Photoshop', 'mdi-file-outline'],
    'playlist': [['pls', 'm3u', 'asx'], 'Playlist', 'mdi-file-outline'],
    'podcast': [['pcast'], 'Podcast', 'mdi-file-outline'],
    'powerpoint': [['pps', 'ppt', 'pptx'], 'Powerpoint', 'mdi-file-powerpoint'],
    'premiere': [['prproj', 'ppj'], 'Adobe Premiere', 'mdi-file-outline'],
    'raw': [['3fr', 'arw', 'bay', 'cr2', 'dcr', 'dng', 'fff', 'mef', 'mrw', 'nef', 'pef', 'rw2', 'srf', 'orf', 'rwl'], 'RAW', 'mdi-file-outline'],
    'real-audio': [['rm', 'ra', 'ram'], 'Real Audio', 'mdi-file-music'],
    'code': [['sh', 'c', 'cc', 'cpp', 'cxx', 'h', 'hpp', 'dll', 'iso'], 'Source code', 'mdi-code-tags'],
    'spreadsheet': [['ods', 'ots', 'gsheet', 'nb', 'xlr', 'numbers'], 'Spreadsheet', 'mdi-file-chart'],
    'swf': [['swf'], 'SWF', 'mdi-file-video'],
    'torrent': [['torrent'], 'Torrent', 'mdi-file-outline'],
    'text': [['txt', 'rtf', 'ans', 'ascii', 'log', 'odt', 'wpd',
    'md', 'cfg', 'conf'], 'Text', 'mdi-file-document'],
    'vcard': [['vcf'], 'Vcard', 'mdi-file-outline'],
    'vector': [['svgz', 'svg', 'cdr', 'eps'], 'Vector', 'mdi-file-outline'],
    'video': [['mkv', 'webm', 'avi', 'mp4', 'm4v', 'mpg', 'mpeg', 'mov', '3g2', '3gp', 'asf', 'wmv'], 'Video', 'mdi-file-video'],
    'flash-video': [['flv'], 'Flash Video', 'mdi-file-video'],
    'video-subtitle': [['srt'], 'Subtitle', 'mdi-file-outline'],
    'webdata': [['html', 'xml', 'shtml', 'dhtml', 'js', 'css'], 'Web Client Code', 'mdi-code-tags'],
    'weblang': [['php', 'php3', 'php4', 'php5', 'phtml', 'inc', 'asp', 'pl', 'cgi', 'py'], 'Web Server Code', 'mdi-code-tags'],
    'word': [['doc', 'docx', 'dotx', 'wps'], 'MS Word', 'mdi-file-word']
};
var extdesc = {
    '3ds': '3D Scene',
    '3dm': '3D Model',
    '3fr': 'RAW Image',
    '3g2': 'Multimedia',
    '3gp': '3D Model',
    '7z': '7-Zip Compressed',
    'accdb': 'Database',
    'aep': 'After Effects',
    'aet': 'After Effects',
    'ai': 'Illustrator',
    'aif': 'Audio Interchange',
    'aiff': 'Audio Interchange',
    'ait': 'Illustrator',
    'ans': 'ANSI Text File',
    'apk': 'Android App',
    'app': 'Mac OSX App',
    'arw': 'RAW Image',
    'as': 'ActionScript',
    'asc': 'ActionScript Com',
    'ascii': 'ASCII Text',
    'asf': 'Streaming Video',
    'asp': 'Active Server',
    'aspx': 'Active Server',
    'asx': 'Advanced Stream',
    'avi': 'A/V Interleave',
    'bat': 'DOS Batch',
    'bay': 'Casio RAW Image',
    'bmp': 'Bitmap Image',
    'bz2': 'UNIX Compressed',
    'c': 'C Source Code',
    'cc': 'C++ Source Code',
    'cdr': 'CorelDRAW Image',
    'cfg': 'Configuration File',
    'cgi': 'CGI Script',
    'class': 'Java Class',
    'com': 'DOS Command',
    'conf': 'Configuration File',
    'cpp': 'C++ Source Code',
    'cr2': 'Raw Image',
    'css': 'CSS Style Sheet',
    'cxx': 'C++ Source Code',
    'dcr': 'RAW Image',
    'db': 'Database',
    'dbf': 'Database',
    'dhtml': 'Dynamic HTML',
    'dll': 'Dynamic Link Library',
    'dng': 'Digital Negative',
    'doc': 'MS Word',
    'docx': 'MS Word',
    'dotx': 'MS Word Template',
    'dwg': 'Drawing DB File',
    'dwt': 'Dreamweaver',
    'dxf': 'DXF Image',
    'eps': 'EPS Image',
    'exe': 'Executable',
    'fff': 'RAW Image',
    'fla': 'Adobe Flash',
    'flac': 'Lossless Audio',
    'flv': 'Flash Video',
    'fnt': 'Windows Font',
    'fon': 'Font',
    'gadget': 'Windows Gadget',
    'gif': 'GIF Image',
    'gpx': 'GPS Exchange',
    'gsheet': 'Spreadsheet',
    'gz': 'Gnu Compressed',
    'h': 'Header',
    'hpp': 'Header',
    'htm': 'HTML Document',
    'html': 'HTML Document',
    'iff': 'Interchange',
    'inc': 'Include',
    'indd': 'Adobe InDesign',
    'iso': 'ISO Image',
    'jar': 'Java Archive',
    'java': 'Java Code',
    'jpeg': 'JPEG Image',
    'jpg': 'JPEG Image',
    'js': 'JavaScript',
    'kml': 'Keyhole Markup',
    'log': 'Log',
    'm3u': 'Media Playlist',
    'm4a': 'MPEG-4 Audio',
    'max': '3ds Max Scene',
    'md': 'Markdown',
    'mdb': 'MS Access',
    'mef': 'RAW Image',
    'mid': 'MIDI Audio',
    'midi': 'MIDI Audio',
    'mkv': 'MKV Video',
    'mov': 'QuickTime Movie',
    'mp3': 'MP3 Audio',
    'mpeg': 'MPEG Movie',
    'mpg': 'MPEG Movie',
    'mrw': 'Raw Image',
    'msi': 'MS Installer',
    'nb': 'Mathematica',
    'numbers': 'Numbers',
    'nef': 'RAW Image',
    'obj': 'Wavefront',
    'ods': 'Spreadsheet',
    'odt': 'Text Document',
    'otf': 'OpenType Font',
    'ots': 'Spreadsheet',
    'orf': 'RAW Image',
    'pages': 'Pages Doc',
    'pcast': 'Podcast',
    'pdb': 'Database',
    'pdf': 'PDF Document',
    'pef': 'RAW Image',
    'php': 'PHP Code',
    'php3': 'PHP Code',
    'php4': 'PHP Code',
    'php5': 'PHP Code',
    'phtml': 'PHTML Web',
    'pl': 'Perl Script',
    'pls': 'Audio Playlist',
    'png': 'PNG Image',
    'ppj': 'Adobe Premiere',
    'pps': 'MS PowerPoint',
    'ppt': 'MS PowerPoint',
    'pptx': 'MS PowerPoint',
    'prproj': 'Adobe Premiere',
    'ps': 'PostScript',
    'psb': 'Photoshop',
    'psd': 'Photoshop',
    'py': 'Python Script',
    'ra': 'Real Audio',
    'ram': 'Real Audio',
    'rar': 'RAR Compressed',
    'rm': 'Real Media',
    'rtf': 'Rich Text',
    'rw2': 'RAW',
    'rwl': 'RAW Image',
    'sh': 'Bash Shell',
    'shtml': 'Server HTML',
    'sitx': 'X Compressed',
    'sql': 'SQL Database',
    'srf': 'Sony RAW Image',
    'srt': 'Subtitle',
    'svg': 'Vector Image',
    'svgz': 'Vector Image',
    'swf': 'Flash Movie',
    'tar': 'Archive',
    'tbz': 'Compressed',
    'tga': 'Targa Graphic',
    'tgz': 'Compressed',
    'tif': 'TIF Image',
    'tiff': 'TIFF Image',
    'torrent': 'Torrent',
    'ttf': 'TrueType Font',
    'txt': 'Text Document',
    'vcf': 'vCard',
    'wav': 'Wave Audio',
    'webm': 'WebM Video',
    'wma': 'WM Audio',
    'wmv': 'WM Video',
    'wpd': 'WordPerfect',
    'wps': 'MS Works',
    'xhtml': 'XHTML Web',
    'xlr': 'MS Works',
    'xls': 'MS Excel',
    'xlsx': 'MS Excel',
    'xlt': 'MS Excel',
    'xltm': 'MS Excel',
    'xml': 'XML Document',
    'zip': 'ZIP Archive',
    'mp4': 'MP4 Video'
};
var previewable = [];
var previewType = {
    'ascii': 'text',
    'avi': 'image',
    'bat': 'text',
    'as': 'text',
    'bmp': 'image',
    'c': 'text',
    'cc': 'text',
    'cfg': 'text',
    'cpp': 'text',
    'com': 'text',
    'conf': 'text',
    'css': 'text',
    'cxx': 'text',
    'dhtml': 'text',
    //'fla': 'flash',
    //'flv': 'flash',
    'gif': 'image',
    'h': 'text',
    'hpp': 'text',
    'htm': 'text',
    'html': 'text',
    'htaccess': 'text',
    'htpasswd': 'text',
    'gitignore': 'text',
    'java': 'text',
    'jpeg': 'image',
    'jpg': 'image',
    'js': 'text',
    'kml': 'text',
    'log': 'text',
    //'m4a': 'audio',
    'md': 'text',
    //'mp3': 'audio',
    //'mpeg': 'video',
    //'mpg': 'video',
    //'pdf': 'pdf',
    'php': 'text',
    'php3': 'text',
    'php4': 'text',
    'php5': 'text',
    'phtml': 'text',
    'pl': 'text',
    'png': 'image',
    'py': 'text',
    'sh': 'text',
    'shtml': 'text',
    //'swf': 'flash',
    'txt': 'text',
    //'wav': 'audio',
    //'webm': 'video',
    'xhtml': 'text',
    'xml': 'text',
    //'mp4': 'video'
};
for (var i in extensions) {
    for (var j in extensions[i][0]) {
        var desc = extensions[i][1];
        var icon = extensions[i][2];
        if (extdesc[extensions[i][0][j]]) {
            desc = extdesc[extensions[i][0][j]];
        }
        ext[extensions[i][0][j]] = [i, desc, icon];
    }
}
for (var i in previewType) {
    previewable.push(i);
}
function getType(fileItem) {
    name = fileItem.name;
    if (fileItem.isFolder()) return "folder";
    var fileExt = getExt(name);
    if (ext[fileExt]) {
        return ext[fileExt][1];
    }
    else if (fileExt && fileExt.length > 1) {
        return fileExt.toUpperCase() + ' File';
    }
    else {
        return 'File';
    }
}
function getExt(name) {
    var ext;
    if (!name) {
        name = 'undefined';
    }
    ext = name.substr(name.lastIndexOf('.') + 1);
    ext = ext.replace(/<[^>]*>/g, '').replace(/\W+/g, '');
    if (ext.length > 9) {
        ext = ext.substr(0, 9);
    }
    return ext.toLowerCase();
}
function getIcon(fileItem) {
    var icon;
    if (fileItem.isFolder() && fileItem.shared) {
        icon = 'mdi-folder-account';
        return icon;
    } else if (fileItem.isFolder()) {
        icon = 'mdi-folder';
        return icon;
    } else if (ext[getExt(fileItem.name)]) {
        icon = ext[getExt(fileItem.name)][2];
        return icon;
    } else {
        icon = 'mdi-file-outline';
        return icon;
    }
}
function isPreviewable(fileItem) {
    return previewable.indexOf(getExt(fileItem.name)) > -1;
}
function getPreviewType(fileItem) {
    var i = previewable.indexOf(getExt(fileItem.name));
    if (i > -1) {
        return previewType[Object.keys(previewType)[i]];  
    }
    else
        return 'nopreview';
}