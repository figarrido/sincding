const request = require('./request');
const cheerio = require('cheerio');
const urls = require('./urls');
const course = require('./course');
const folder = require('./folder');
const file = require('./file');

class Course {
  constructor(id, acronym, name) {
    this.id = id;
    this.acronym = acronym;
    this.name = name;
    this.url = urls.courseURL(id);
    this.folders = {};
    this.files = {};
  }

  sync() {
    this.folders = {};
    this.files = {};
    return new Promise((res, rej) => {
      request(this.url, (err, http, body) => {
        console.log(`Parsing ${this.path()} files`);
        const newFolders = this.searchFoldersAndFiles(body, this);
        if (newFolders.lenght === 0) {
          return res(this);
        }
        Promise.all(newFolders.map(folder => this.syncFolder(folder)))
          .then(() => {
            res(this);
          });
      });
    });
  }

  syncFolder(folder) {
    return new Promise((res, rej) => {
      request(folder.url, (err, http, body) => {
        console.log(`Parsing ${folder.path()} files`);
        const newFolders = this.searchFoldersAndFiles(body, folder);
        if (newFolders.lenght === 0) {
          return res();
        }
        Promise.all(newFolders.map(folder => this.syncFolder(folder)))
          .then(() => {
            res();
          });
      });
    });
  }

  searchFoldersAndFiles(body, parent) {
    const $ = cheerio.load(body);
    const newFolders = [];
    $('a').each((i, l) => {
      const link = $(l).attr('href');
      const name = $(l).text();
      if (link.indexOf('acc_carp') !== -1) {
        const linkId = link.match(/id_carpeta=\d+/g)[0].split('=')[1];
        if (this.folders[linkId]) {
          return;
        }
        const newFolder = new folder(
          linkId,
          name,
          urls.courseFolderURL(link),
          parent
        );
        newFolders.push(newFolder);
        this.folders[linkId] = newFolder;
      } else if (link.indexOf('id_archivo') !== -1) {
        const linkId = link.match(/id_archivo=\d+/g)[0].split('=')[1];
        if (this.files[linkId]) {
          return;
        }
        const newFile = new file(
          linkId,
          name,
          urls.courseFileURL(link),
          parent
        );
        this.files[linkId] = newFile;
      }
    });
    return newFolders;
  }

  path() {
    return this.acronym + ' ' + this.name;
  }
}

module.exports = Course;
