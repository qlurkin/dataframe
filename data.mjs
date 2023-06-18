import express from "express"
import fs from 'fs/promises'
import { dirname } from 'path'
import { URL } from 'node:url'
import open from 'open'

export function append(target, source, columns) {
  for(const student of target) {
    try {
      const source_student = find(source, student.matricule)
      for(const column of columns) {
        student[column] = source_student[column]
      }
    }
    catch {
      for(const column of columns) {
        student[column] = null
      }
    }
  }
}

export function fuzzySearch(items, query) {
  const search = query.split(' ')
  const ret = items.reduce((found, i) => {
    let matches = 0
    search.forEach(s => {
      let props = 0
      for(const prop in i) {
        if(i[prop].indexOf(s) > -1) {
          props++
        }
      }
      if (props >= 1) {
        matches++
      }
    })
    if (matches == search.length) {
      console.log(i, found, 'was found')
      found.push(i)
    }
    return found
  }, [])
  return ret
}

export function rename_column(students, column, new_name) {
  for(const student of students) {
    student[new_name] = student[column]
    delete student[column]
  }
}

export function find(students, matricule) {
  for(const student of students) {
    if(student.matricule === matricule) return student
  }
  throw new Error('no such student: ' + matricule)
}

export async function write_ecam_csv(code, students) {
  let content = `ae;matricule;cote;stat`
  for(const student of students) {
    content += `\n${code};${student.matricule};${student.grade};`
  }
  await fs.writeFile(`${code}.csv`, content)
}



export function serve(students, title) {
  const app = express()

  app.get('/data', (req, res) => {
    res.send({
      title,
      students
    })
  })

  app.get('/', (req, res) => {
    const url = new URL(import.meta.url)
    const root = dirname(url.pathname)
    res.sendFile('./index.html', {root})
  })

  app.get('/close', (req, res) => {
    console.log('Server Shutdown Requested...')
    res.send({ok: true})
    srv.close(() => {
      console.log('HTTP server closed')
      process.exit()
    })
    srv.emit('close')
  })

  const srv = app.listen(0, () => {
    const port = srv.address().port
    console.log(`Listen on port ${port}`)
    open(`http://localhost:${port}`)
  })
}

export function fill_null(students, columns, value) {
  for(const student of students) {
    for(const column of columns) {
      if(student[column] === null)
      student[column] = value
    }
  }
}

export function round_to_half(students, column) {
  for(const student of students) {
    student[column] = Math.round(student[column]*2)/2
  }
}

export function round_to_tenth(students, column) {
  for(const student of students) {
    student[column] = Math.round(student[column]*10)/10
  }
}

