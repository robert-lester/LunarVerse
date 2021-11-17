import * as fs from 'fs';
import * as path from 'path';

export function files(dir: string, filelist: string[] = []): string[] {
  const list: string[] = fs.readdirSync(dir);
  list.forEach((item: string) => {
    const filepath: string = path.join(dir, item);
    if (fs.statSync(filepath).isDirectory() && !path.dirname(filepath).includes('node_modules')) {
      filelist = files(filepath, filelist);
    } else {
      if (!path.dirname(filepath).includes('node_modules')) {
        filelist.push(filepath);
      }
    }
  })
  return filelist;
}

export function directories(dir: string, dirlist: string[] = [], shouldReturnOnlyNodeModules: boolean = true): string[] {
  const list: string[] = fs.readdirSync(dir);
  
  // Loop through and find only subfolders that need installing
  if (shouldReturnOnlyNodeModules) {
    list.forEach((item: string) => {
      const filepath: string = path.join(dir, item);
      if (fs.statSync(filepath).isDirectory() && !path.dirname(filepath).includes('node_modules')) {
        let containsNodeModules: boolean = false;
        const subfiles:string[] = fs.readdirSync(filepath);
        subfiles.forEach((i: string) => {
          if (path.basename(path.join(filepath,i)).includes('package.json')) {
            containsNodeModules = true;
          }
        });
        if (!(path.dirname(filepath).includes('.webpack') || path.dirname(filepath).includes('.serverless'))) {
          dirlist = directories(filepath, dirlist);
          if (containsNodeModules) {
            dirlist.push(filepath);
          }
        }
      }
    });
    return dirlist;
  } 
  
  // Otherwise just list out everything that isn't a node_modules folder
  else {
    list.forEach((item: string) => {
      const filepath: string = path.join(dir, item);
      if (fs.statSync(filepath).isDirectory() && !path.dirname(filepath).includes('node_modules')) {
        dirlist.push(filepath);
        dirlist = directories(filepath, dirlist);
      }
    });
    return dirlist;
  }
}