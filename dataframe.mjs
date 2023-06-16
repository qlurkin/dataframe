import { append, rename_column, find, write_ecam_csv, serve, fill_null, round_to_half, round_to_tenth } from './data.mjs'
import fs from 'fs/promises'

function copy(students) {
    return students.map(s => ({...s}))
}

function dynamic_typing(value) {
    if(value === 'true') return true
    if(value === 'false') return false
    if(value === 'null') return null
    const number = parseFloat(value)
    if(isNaN(number)) return value
    if(number > 9007199254740992) return value
    if(number < -9007199254740992) return value
    return number
}

export async function load_csv(filename) {
    const content = await fs.readFile(filename, {encoding: 'utf8'})
    const lines = content.split('\n').map(line => line.trim())
    const headers = lines[0].split(';')
    const records = lines.slice(1).map(line => line.split(';'))
    const objects = records.map(record => {
        if(record.length !== headers.length) {
            throw new Error('Mismatch in record length')
        }

        const res = {}
        for(let i=0; i<headers.length; i++) {
            if(headers[i] !== 'matricule')
                res[headers[i]] = dynamic_typing(record[i])
            else
                res[headers[i]] = record[i]
        }
        return res
    })
    return Dataframe(objects)
}

export async function load_check_exo_report(filename) {
    const content = JSON.parse(await fs.readFile(filename, {encoding: 'utf8'})).students
    const students = content.map(student => ({
        matricule: student.student.matricule,
        name: student.student.name,
        grade: student.grade,
    }))
    return Dataframe(students)
}

export function Dataframe(array_of_objects) {
    const columns = Object.keys(array_of_objects[0])
    const data = copy(array_of_objects)

    const that = {
        data,
        columns,
        left_join: source => {
            const res = copy(data)
            const cols = [...source.columns]
            var index = cols.indexOf('matricule')
            cols.splice(index, 1)
            append(res, source.data, cols)
            return Dataframe(res)
        },
        select: cols => {
            if(!cols.includes('matricule')) cols = ['matricule', ...cols]
            return Dataframe(data.map(row => {
                const res = {}
                for(const col of cols) {
                    res[col] = row[col]
                }
                return res
            }))
        },
        rename: (column, new_name) => {
            const new_data = copy(data)
            rename_column(new_data, column, new_name)
            return Dataframe(new_data)
        },
        students: matricules => {
            const res = []
            for(const matricule of matricules) {
                res.push(that.student(matricule))
            }
            return Dataframe(res)
        },
        student: matricule => {
            return {...find(data, matricule)}
        },
        write_ecam_csv: code => {
            write_ecam_csv(code, data)
            return that
        },
        serve: () => {
            serve(data)
            return that
        },
        fill_null: (columns, value) => {
            const new_data = copy(data)
            fill_null(new_data, columns, value)
            return Dataframe(new_data)
        },
        round_to_half: column => {
            const new_data = copy(data)
            round_to_half(new_data, column)
            return Dataframe(new_data)
        },
        round_to_tenth: column => {
            const new_data = copy(data)
            round_to_tenth(new_data, column)
            return Dataframe(new_data)
        },
        map: fun => {
            return Dataframe(data.map(student => fun({...student})))
        },
        log: () => {
            console.log(data)
            return that
        }
    }

    return that
}