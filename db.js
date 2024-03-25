import  sqlite3  from 'sqlite3';
const fmDB={}
export default fmDB
fmDB.initDB =()=>{
    fmDB.db = new sqlite3.Database("./fmath.db");
    const  query  =  `
    --kdkfksadkfas
    CREATE TABLE IF NOT EXISTS posts2 (
    id integer PRIMARY KEY,--fadfasdf
    title text,
    description text,
    createDate text,
   author text )`;

   fmDB.db.run(query);    // fmDB.db.close();
}
fmDB.test = ()=>{
    // fmDB.db = new sqlite3.Database("./fmath.db");
    let tdb=fmDB.db;
    // const tdb = new sqlite3.Database("./fmath.db");
    tdb.serialize(()=>{
        // tdb.run("");
        tdb.each("select rowid as id,tableid as info from test",(err,row)=>{
            console.log(row.id + ": " + row.info);
        })
    })
    // tdb.close()
}


// export default initDB;
