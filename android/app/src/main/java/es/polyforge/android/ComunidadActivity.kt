package es.polyforge.android

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.launch

class ComunidadActivity : ComponentActivity() {
    private var posts by mutableStateOf<List<Publicacion>>(emptyList())
    private var ocupado by mutableStateOf(false)
    private var aviso by mutableStateOf("")
    private var pendiente by mutableStateOf<Publicacion?>(null)
    private val editor = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) {
        if (it.resultCode == RESULT_OK) cargar()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme(colorScheme = darkColorScheme(primary = Color(0xFFBD9EFF))) {
                Surface(Modifier.fillMaxSize()) { Comunidad() }
            }
        }
        cargar()
    }

    @Composable
    private fun Comunidad() {
        var soloGuardados by remember { mutableStateOf(false) }
        val visibles = if (soloGuardados) posts.filter { it.guardado } else posts
        LazyColumn(
            modifier = Modifier.fillMaxSize().systemBarsPadding(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            item {
                Text("Comunidad", style = MaterialTheme.typography.headlineMedium)
                Text("Publicaciones de PolyForge")
                Button(onClick = { abrirEditor(null) }, enabled = !ocupado) { Text("Nueva publicación") }
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    FilterChip(!soloGuardados, { soloGuardados = false }, { Text("Todas") })
                    FilterChip(soloGuardados, { soloGuardados = true }, { Text("Guardadas") })
                }
                OutlinedButton(onClick = ::cargar, enabled = !ocupado) { Text("Actualizar") }
                TextButton(onClick = { ejecutar { Api.salir(); volverAlAcceso() } }, enabled = !ocupado) {
                    Text("Cerrar sesión")
                }
                if (ocupado) LinearProgressIndicator(Modifier.fillMaxWidth())
                if (aviso.isNotEmpty()) Text(aviso)
                if (!ocupado && aviso.isEmpty() && visibles.isEmpty()) Text("No hay publicaciones.")
            }
            items(visibles, key = { it.id }) { post ->
                Card {
                    Column(Modifier.fillMaxWidth().padding(16.dp)) {
                        Text(post.titulo, style = MaterialTheme.typography.titleLarge)
                        Text(post.descripcion)
                        Row {
                            TextButton(onClick = { marcar(post, false) }, enabled = !ocupado) {
                                Text(if (post.gustado) "Quitar like · ${post.likes}" else "Me gusta · ${post.likes}")
                            }
                            TextButton(onClick = { marcar(post, true) }, enabled = !ocupado) {
                                Text(if (post.guardado) "Desguardar" else "Guardar")
                            }
                        }
                        if (post.propio) {
                            Row {
                                TextButton(onClick = { abrirEditor(post) }, enabled = !ocupado) { Text("Editar") }
                                TextButton(onClick = { pendiente = post }, enabled = !ocupado) { Text("Eliminar") }
                            }
                        }
                    }
                }
            }
        }
        pendiente?.let { post ->
            AlertDialog(
                onDismissRequest = { pendiente = null },
                title = { Text("Eliminar publicación") },
                text = { Text("¿Eliminar «${post.titulo}»?") },
                dismissButton = { TextButton(onClick = { pendiente = null }) { Text("Cancelar") } },
                confirmButton = {
                    TextButton(onClick = {
                        pendiente = null
                        ejecutar {
                            Api.borrar(post.id)
                            posts = posts.filterNot { it.id == post.id }
                            aviso = "Publicación eliminada."
                        }
                    }) { Text("Eliminar") }
                },
            )
        }
    }

    private fun abrirEditor(post: Publicacion?) {
        val intent = Intent(this, EditorActivity::class.java)
        if (post != null) {
            intent.putExtra("id", post.id)
            intent.putExtra("titulo", post.titulo)
            intent.putExtra("descripcion", post.descripcion)
        }
        editor.launch(intent)
    }

    private fun cargar() = ejecutar { posts = Api.publicaciones() }

    private fun marcar(post: Publicacion, guardado: Boolean) = ejecutar {
        Api.marcar(post.id, guardado, if (guardado) !post.guardado else !post.gustado)
        posts = Api.publicaciones()
    }

    private fun ejecutar(operacion: suspend () -> Unit) {
        if (ocupado) return
        ocupado = true
        aviso = ""
        lifecycleScope.launch {
            try {
                operacion()
            } catch (error: CancellationException) {
                throw error
            } catch (error: Exception) {
                if ((error as? ErrorApi)?.estado == 401) volverAlAcceso()
                else aviso = mensajeError(error)
            } finally {
                ocupado = false
            }
        }
    }

    private fun volverAlAcceso() {
        startActivity(Intent(this, AccesoActivity::class.java))
        finish()
    }
}
