import express from "express"
import fs from 'fs/promises'

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



export function serve(students) {
    const app = express()

    app.get('/data', (req, res) => {
        res.send(students)
    })

    app.use(express.static('public'))

    const port = 3000

    app.listen(port, () => {
        console.log(`Listen on port ${port}`)
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

