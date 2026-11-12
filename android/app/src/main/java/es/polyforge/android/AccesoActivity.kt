package es.polyforge.android

import android.content.Intent
import android.os.Bundle
import android.util.Patterns
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import androidx.activity.ComponentActivity
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.launch

class AccesoActivity : ComponentActivity() {
    private var registro = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.acceso)
        ajustarBarras(findViewById(R.id.pantalla))
        val titulo = findViewById<TextView>(R.id.titulo)
        val correo = findViewById<EditText>(R.id.correo)
        val clave = findViewById<EditText>(R.id.clave)
        val aviso = findViewById<TextView>(R.id.aviso)
        val entrar = findViewById<Button>(R.id.entrar)
        val alternar = findViewById<Button>(R.id.alternar)
        fun actualizarModo() {
            titulo.text = if (registro) "Crear cuenta" else "Iniciar sesión"
            entrar.text = titulo.text
            alternar.text = if (registro) "Volver a iniciar sesión" else "¿No tienes cuenta? Regístrate"
        }
        registro = savedInstanceState?.getBoolean("registro") ?: false
        actualizarModo()
        alternar.setOnClickListener {
            registro = !registro
            clave.text.clear()
            aviso.text = ""
            actualizarModo()
        }
        entrar.setOnClickListener {
            val email = correo.text.toString().trim()
            val password = clave.text.toString()
            if (!Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
                correo.error = "Introduce un correo válido"
                return@setOnClickListener
            }
            if (password.isBlank() || password.length < 8 || password.toByteArray().size > 72) {
                clave.error = "Introduce una contraseña válida de al menos 8 caracteres"
                return@setOnClickListener
            }
            entrar.isEnabled = false
            alternar.isEnabled = false
            aviso.text = "Conectando…"
            lifecycleScope.launch {
                try {
                    if (registro) {
                        Api.registrar(email, password)
                        registro = false
                        actualizarModo()
                        clave.text.clear()
                        aviso.text = "Cuenta creada. Ya puedes iniciar sesión."
                    } else {
                        Api.entrar(email, password)
                        startActivity(Intent(this@AccesoActivity, ComunidadActivity::class.java))
                        finish()
                    }
                } catch (error: CancellationException) {
                    throw error
                } catch (error: Exception) {
                    aviso.text = mensajeError(error)
                } finally {
                    entrar.isEnabled = true
                    alternar.isEnabled = true
                }
            }
        }
    }

    override fun onSaveInstanceState(outState: Bundle) {
        outState.putBoolean("registro", registro)
        super.onSaveInstanceState(outState)
    }
}

fun ajustarBarras(vista: View) {
    ViewCompat.setOnApplyWindowInsetsListener(vista) { view, insets ->
        val margen = insets.getInsets(WindowInsetsCompat.Type.systemBars() or WindowInsetsCompat.Type.ime())
        view.setPadding(margen.left, margen.top, margen.right, margen.bottom)
        insets
    }
}
