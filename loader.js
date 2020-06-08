import connection from './mysql.js'
import mongoose from 'mongoose';
import util from 'util';

/**
 * @description Transformación en promesas los métodos de mySQL
 * 
 *  
 */

const queryMySQL = util.promisify(connection.query).bind(connection);

/**
 * @description Detección del evento de final de programa
 *              Imporime el código de finalización por consola
 */

process.on('exit', (code) => {
    console.log(`Exit with code: ${code}`);
  });

/**
 * @description Conexión a MongoDB
 * @function mongoose.connect(@param url,@param options)
 * @constant filmSchema
 * @constructor Film
 */  

const url = `mongodb+srv://neoland:neoland@cluster0-azhpf.mongodb.net/mymovies?retryWrites=true&w=majority`;

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });


const filmSchema = new mongoose.Schema({
    titulo: String,
    titulo_original: String,
    anyo: String,
    productora: String,
    musica: String,
    fotografia: String,
    premios: String,
    pais: String,
    duracion: Number,
    idsoporte: Number,
    actores: Array
})

const Film = mongoose.model('Film', filmSchema)

/**
 * @description Función filmLoader; función principal.
 * 
 * Realiza las siguientes tareas:
 ***** * 1- Select de los datos de película
 ***** * 2- Recorre el array de películas y ejecuta la query para obtener los actores
 ***** * 3- Guarda nombre y apellidos en un campo actores del documento de película
 ***** * 4- Realiza el insert en la colección films del documento de película 
 ***** * 5- Cierra la conexión a Mongoose
 ***** * 6- Sale del programa
 */

const filmLoader = async () => {
    try {
        const sqlFilm = `SELECT  p.titulo
                                ,p.titulo_original
                                ,p.anyo
                                ,p.productora
                                ,p.musica
                                ,p.fotografia
                                ,p.premios
                                ,p.pais
                                ,p.duracion
                                ,p.idsoporte
                                ,p.id
                            FROM pelicula p`;

        const sqlActor = `SELECT a.nombre, 
                                 a.apellidos 
                            FROM actor a, pelicula_actor pa
                            WHERE a.id = pa.actor_id 
                            AND pa.pelicula_id=?`

        const films = await queryMySQL(sqlFilm);

        await Promise.all(films.map( async element =>{
        const actors = await queryMySQL(sqlActor,element.id);

        const resultado = await new Film({
            titulo: element.titulo
            , titulo_original: element.titulo_original
            , anyo: element.anyo
            , productora: element.productora
            , musica: element.musica
            , fotografia: element.fotografia
            , premios: element.premios
            , pais: element.pais
            , duracion: element.duracion
            , idsoporte: element.idsoporte
            , actores: actors.map(element => element.nombre + ' ' + element.apellidos)
        }).save();

        })).then(_=>{
        mongoose.connection.close();
        //connection.close()
        process.exit(0)}).catch(error => console.log(error))

//        return peliculas;

    } catch (error) {
            console.log(error);
    }

}

filmLoader();
