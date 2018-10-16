import fs from 'fs'
import os from 'os'
import path from 'path'
import Dat from 'dat'
import level from 'level'

const dir = os.homedir() + '/.bolo'
console.log('root directory:', dir)

// ibu <-- individu. fil de l'utilisateur
// kana <-- cercle d'amis : les utilisateurs suivis
// sila <-- hospitalité : stockage des fils des autres utilisateurs

class Bolo {
    constructor(dir) {
        this.dir = dir
        this.kana = []
    }

    join() {
        // join ibu
        this.ibu = new Pili(path.join(this.dir, 'ibu'))
        this.ibu.join()

        // join kana
        let dir = path.join(this.dir, 'sila')
        fs.readdir(dir, {withFileTypes:true}, (err,files) => {
            if (!err) {
                for (var i = 0; i<files.length; i++) {
                    if (files[i].isDirectory()) {
                        let dir = files[i].name
                        console.log(dir)
                        this.kana.push(new Pili(dir))
                    }
                }
            }
        })
    }

    follow(key) {
        let dir = path.join(this.dir, 'sila', key)
        this.kana.push(new Pili(dir, {key:key}))
    }
}

// Communication --> flux dat d'un utilisateur
class Pili {
    constructor(dir, opts={}) {
        this.dir = dir
        this.opts = opts
    }

    join() {
        if (!this.dat) {
            Dat(this.dir, this.opts, (err,dat) => {
                if (err) throw err
                dat.joinNetwork()
                this.key = dat.key.toString('hex')
                console.log('following', this.key)
                console.log('directory', this.dir)
                this.dat = dat
            })
        }
    }

    leave() {
        if (this.dat) {
            this.dat.leave()
            this.dat = null
        }
    }

    remove() {
        this.leave()
        fs.rmdir(this.dir, err => {
            if (err) throw err
        })
    }
}

const b = new Bolo(dir)
b.join()
