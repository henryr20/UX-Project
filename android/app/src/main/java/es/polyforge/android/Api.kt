package es.polyforge.android

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException
import java.net.CookieManager
import java.net.HttpURLConnection
import java.net.URI

data class Publicacion(val id: Long, val titulo: String, val descripcion: String, val likes: Int,
    val gustado: Boolean, val guardado: Boolean, val propio: Boolean)

class ErrorApi(val estado: Int) : IOException("HTTP $estado")

object Api {
    private val cookies = CookieManager()

    suspend fun registrar(correo: String, clave: String) = credenciales("/registro", correo, clave)
    suspend fun entrar(correo: String, clave: String) = credenciales("/sesion", correo, clave)

    suspend fun salir() {
        solicitar("/sesion", "DELETE")
        cookies.cookieStore.removeAll()
    }

    suspend fun publicaciones(): List<Publicacion> {
        val datos = JSONArray(solicitar("/posts"))
        return List(datos.length()) { i ->
            val post = datos.getJSONObject(i)
            Publicacion(post.getLong("id"), post.getString("titulo"), post.getString("descripcion"),
                post.getInt("likes"), post.getBoolean("gustado"), post.getBoolean("guardado"),
                post.getBoolean("propio"))
        }
    }

    suspend fun guardar(id: Long?, titulo: String, descripcion: String) {
        val datos = JSONObject().put("titulo", titulo).put("descripcion", descripcion)
        if (id == null) solicitar("/posts", "POST", datos) else solicitar("/posts/$id", "PUT", datos)
    }

    suspend fun borrar(id: Long) { solicitar("/posts/$id", "DELETE") }

    suspend fun marcar(id: Long, guardado: Boolean, activo: Boolean) {
        val tipo = if (guardado) "guardado" else "like"
        solicitar("/posts/$id/$tipo", "PUT", JSONObject().put("activo", activo))
    }

    private suspend fun credenciales(ruta: String, correo: String, clave: String) {
        solicitar(ruta, "POST", JSONObject().put("email", correo).put("password", clave))
    }

    private suspend fun solicitar(ruta: String, metodo: String = "GET", datos: JSONObject? = null) =
        withContext(Dispatchers.IO) {
            val csrf = if (metodo == "GET") null else JSONObject(peticion("/csrf", "GET", null, null))
            peticion(ruta, metodo, datos, csrf)
        }

    private fun peticion(ruta: String, metodo: String, datos: JSONObject?, csrf: JSONObject?): String {
        val uri = URI.create(BuildConfig.API_URL.trimEnd('/') + ruta)
        val conexion = uri.toURL().openConnection() as HttpURLConnection
        try {
            conexion.requestMethod = metodo
            conexion.instanceFollowRedirects = false
            conexion.connectTimeout = 5000
            conexion.readTimeout = 10000
            cookies.get(uri, emptyMap()).forEach { (nombre, valores) ->
                conexion.setRequestProperty(nombre, valores.joinToString("; "))
            }
            if (csrf != null) conexion.setRequestProperty(csrf.getString("headerName"), csrf.getString("token"))
            if (datos != null) {
                conexion.doOutput = true
                conexion.setRequestProperty("Content-Type", "application/json; charset=utf-8")
                conexion.outputStream.use { it.write(datos.toString().toByteArray(Charsets.UTF_8)) }
            }
            val estado = conexion.responseCode
            cookies.put(uri, conexion.headerFields.filterKeys { it != null })
            if (estado !in 200..299) throw ErrorApi(estado)
            if (estado == 204) return ""
            return conexion.inputStream.bufferedReader(Charsets.UTF_8).use { it.readText() }
        } finally {
            conexion.disconnect()
        }
    }
}

fun mensajeError(error: Exception): String = when ((error as? ErrorApi)?.estado) {
    400 -> "Revisa los datos introducidos."
    401 -> "Credenciales incorrectas o sesión caducada."
    403 -> "La solicitud no se pudo autorizar."
    404 -> "La publicación ya no está disponible."
    409 -> "Ya hay una cuenta con ese correo."
    else -> "No se pudo completar la operación. Comprueba la conexión con PolyForge."
}
