package es.polyforge.android

import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import androidx.activity.ComponentActivity
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.launch

class EditorActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.editor)
        ajustarBarras(findViewById(R.id.pantalla))
        val id = intent.getLongExtra("id", -1).takeIf { it > 0 }
        val asunto = findViewById<EditText>(R.id.asunto)
        val descripcion = findViewById<EditText>(R.id.descripcion)
        val guardar = findViewById<Button>(R.id.guardar)
        val cancelar = findViewById<Button>(R.id.cancelar)
        val aviso = findViewById<TextView>(R.id.aviso)
        findViewById<TextView>(R.id.titulo).text = if (id == null) "Nueva publicación" else "Editar publicación"
        if (savedInstanceState == null) {
            asunto.setText(intent.getStringExtra("titulo"))
            descripcion.setText(intent.getStringExtra("descripcion"))
        }
        cancelar.setOnClickListener { finish() }
        guardar.setOnClickListener {
            val titulo = asunto.text.toString().trim()
            val detalle = descripcion.text.toString().trim()
            if (titulo.isEmpty() || detalle.isEmpty()) {
                aviso.text = "Completa el título y la descripción."
                return@setOnClickListener
            }
            guardar.isEnabled = false
            cancelar.isEnabled = false
            aviso.text = "Guardando publicación…"
            lifecycleScope.launch {
                try {
                    Api.guardar(id, titulo, detalle)
                    setResult(RESULT_OK)
                    finish()
                } catch (error: CancellationException) {
                    throw error
                } catch (error: Exception) {
                    aviso.text = mensajeError(error)
                } finally {
                    guardar.isEnabled = true
                    cancelar.isEnabled = true
                }
            }
        }
    }
}
