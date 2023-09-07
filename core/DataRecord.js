
const dbManager = require("./pgPoolManager")
const logger = require("./Logger")

class DataRecord {
  request;
  resource;
  render;
  
  constructor(request, resource, render){
    this.request  = request;
    this.resource = resource;
    this.render   = render;
  }
  
  //getResource(){ return this.resource }
  //getQueryParams(){ return this.request.query }
  /*
  #columnsVal;
  columns(val){ this.#columnsVal = val; }
  
  #whereVal;
  where(val){ this.#whereVal = val; }
  
  #orderBy;
  orderBy(val){ this.#orderBy = val; }
  
  selectQuery(){ return `SELECT ${ this.#columnsVal == null ? "*" : this.#columnsVal } ` }
  fromQuery()  { return ` FROM ${this.getResource()}` }
  whereQuery() { return ` ${ this.#whereVal == null ? "" : `WHERE ${this.#whereVal}` }` }
  orderByQuery() { return ` ${ this.#orderBy == null ? "" : `ORDER BY ${this.#orderBy}` }` }
  
  runSelect(callback){
    this.run(`${this.selectQuery()} ${this.fromQuery()} ${this.whereQuery()} ${this.orderByQuery()}`, callback)
  }
  
  runInsert(values, callback){
    if (this.#columnsVal == null){
      callback("Columns cannot be null for  Insert Request", [])
      return;
    }
    
    var qurString = `INSERT INTO ${this.getResource()}(${this.#columnsVal}) VALUES (${values}) RETURNING *;`
    this.run(qurString, callback)
  }

  runUpdate(callback){
    if (this.#columnsVal == null){
      callback("Columns cannot be null for  Insert Request", [])
      return;
    }
    
    var qurString = `UPDATE ${this.getResource()} SET ${this.#columnsVal} ${ this.whereQuery() } RETURNING *;`
    this.run(qurString, callback)
  }

    runDelete(callback){
      if (this.#whereVal == null){
        callback("Where clause cannot be null for  Delete Request", [])
        return;
      }

      var qurString = `DELETE FROM ${this.getResource()} ${ this.whereQuery() }`
      this.run(qurString, callback)
    }

    run(query, callback){
      console.log("Running Query: " + query)
      dbManager.execute(query, (err, result)=>{
        this.#columnsVal = null;
        this.#whereVal = null;
        callback(err, result)
      });
    }
*/

    kQCommand = "SELECT"
    kQColumns = " * "
    kQCondition = ""
    kQInsert = ""
    kQConnector = "AND"
    kQFinal = "";

    
    #createQuery(){
      if (this.kQFinal == ""){
        this.kQTable = ` FROM ${this.resource} `

        switch(this.kQCommand){
          case "SELECT":
              this.kQFinal = this.kQCommand + this.kQColumns + "FROM " + this.resource + (this.kQCondition ? (" WHERE " + this.kQCondition) : "")
              
            break;
          case "INSERT":
            this.kQFinal = this.kQCommand + " INTO " + this.resource + " " + this.kQInsert + " RETURNING *"
            break;
            case "UPDATE":
              this.kQFinal = this.kQCommand + " " + this.resource + " SET " + this.kQInsert + (this.kQCondition ? (" WHERE " + this.kQCondition) : "") + " RETURNING *"
              break;
            case "DELETE":
                this.kQFinal = this.kQCommand + " FROM " + this.resource + (this.kQCondition ? (" WHERE " + this.kQCondition) : "")
                break;
            default:
        }
      }
    }

    logQuery(){ 
      this.#createQuery() 
      
      logger.log("Query: " + this.kQFinal)

      return this
    }

    load(callback){
      this.logQuery()

      dbManager.execute(this.kQFinal, (err, result)=>{
        logger.log_check(result ? JSON.stringify(result.rows) : err, err ? 'fail' : 'pass')
        callback(err, result)
      });
      
      return this;
    }

    // Reduce array of strings with "," and set it as the columns to be recieved
    pluck(colArray){
      this.kQColumns = ` ${colArray.join(',')} `
      return this
    }

    /*  READ  */

    // Get all items for an object
    all(){
      this.kQCommand = "SELECT"
      this.kQCondition = ""

      return this
    }

    // This method return the object with the given id
    find(id){
      this.kQCondition = "id = " + id
      return this
    }

    // This method is responsible for updating the where clause respecting any previous values
    overwriteWhere(whereClause){
      kQCondition = whereClause
    }
    
    and(){
      this.kQConnector = "AND"
      return this
    }
    or(){
      this.kQConnector = "OR"
      return this
    }
    // {"col":"val"}
    where(whereJSON, connector="AND"){
      var conditions = []
      for(var attributename in whereJSON){
        conditions.push(attributename + " = " + whereJSON[attributename]);
      }
      this.kQCondition = conditions.join(` ${connector.toUpperCase()} `)
      
      return this
    }
    
    #compoundQuery(qry){
      return (this.kQCondition ? (this.kQCondition + " " + this.kQConnector) : "" ) + " " + qry
    }

    // "col"
    whereNull(columnName){
      this.kQCondition = this.#compoundQuery(columnName + " IS NULL")
      return this
    }
    
    // "col"
    whereNotNull(columnName){
      this.kQCondition = this.#compoundQuery(columnName + " IS NOT NULL")
      return this
    }
    
    // {"col":"val"}
    whereLike(whereJSON){
      this.kQCondition = this.#compoundQuery(columnName + " IS NOT NULL")
      return this
    }

    // {"col":["val1","val2"]}
    whereIN(whereJSON){
      
      var conditions = []
      for(var attributename in whereJSON){
        var q = "(" + whereJSON[attributename].join(",") + ")"
        conditions.push(attributename + " IN " + q);
      }
      
      conditions.forEach((condition) => {
        this.kQCondition = this.#compoundQuery(condition)
      });
      
      return this
    }

    // {"col":["val1","val2"]}
    whereBetween(first_value, second_value){}

    /* INSERT */
    // This method creates a new object based on the type
    create(objJSON){
      
      let cols = `${Object.keys(objJSON).join(",")}`
      //var vals = Object.keys(objJSON).map(x => objJSON[x]).join(",")
      var vals = Object.values(objJSON).join(",")

      this.kQCommand = "INSERT"
      this.kQInsert = `(${cols}) VALUES (${vals})`

      return this
    }

    /* UPDATE */
    update(objJSON){
      var setArr = []

      Object.keys(objJSON).forEach((key)=>{
        setArr.push(`${key} = ${objJSON[key]}`)
      })

      this.kQCommand = 'UPDATE'
      this.kQInsert = setArr.join(', ')

      return this
    }

    

    /* DELETE */
    
    // Destroy an object based on the id provided
    delete(){
      this.kQCommand = 'DELETE';
      return this;
    }
}
module.exports = DataRecord




