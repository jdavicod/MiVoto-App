package com.pascualbravo.conteoelectoral

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.pascualbravo.conteoelectoral.data.AppDatabase
import kotlinx.coroutines.launch

/**
 * Activity Principal / Módulo de Votación (Ingreso y Validación del Elector)
 * Cubre:
 * - HU-01: Ingreso de datos del elector (Documento y Edad con EditTexts numéricos).
 * - HU-02: Validación de mayoría de edad (edad >= 18 años).
 * - HU-05: Impedir voto duplicado (revisión en SQLite).
 */
class MainActivity : AppCompatActivity() {

    private lateinit var etDocumento: EditText
    private lateinit var etEdad: EditText
    private lateinit var btnValidar: Button
    private lateinit var btnIrAdmin: Button
    private lateinit var db: AppDatabase

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        etDocumento = findViewById(R.id.etDocumento)
        etEdad = findViewById(R.id.etEdad)
        btnValidar = findViewById(R.id.btnValidar)
        btnIrAdmin = findViewById(R.id.btnIrAdmin)

        db = AppDatabase.getDatabase(this)

        btnValidar.setOnClickListener {
            validarElectorYProceder()
        }

        btnIrAdmin.setOnClickListener {
            val intent = Intent(this, AdminActivity::class.java)
            startActivity(intent)
        }
    }

    private fun validarElectorYProceder() {
        val documento = etDocumento.text.toString().trim()
        val edadTexto = etEdad.text.toString().trim()

        // HU-01: Validación de campo documento
        if (documento.isEmpty()) {
            etDocumento.error = "Debe ingresar el número de documento"
            etDocumento.requestFocus()
            return
        }

        // HU-01: Validación de campo edad
        if (edadTexto.isEmpty()) {
            etEdad.error = "Debe ingresar la edad del elector"
            etEdad.requestFocus()
            return
        }

        val edad = edadTexto.toIntOrNull()
        if (edad == null || edad <= 0) {
            etEdad.error = "Ingrese una edad numérica válida"
            etEdad.requestFocus()
            return
        }

        // HU-02: Validación legal de mayoría de edad en Colombia (>= 18)
        if (edad < 18) {
            Toast.makeText(
                this,
                "Acceso bloqueado: El elector tiene $edad años y es menor de edad. Solo pueden votar mayores de 18 años.",
                Toast.LENGTH_LONG
            ).show()
            return
        }

        // HU-05: Verificar en SQLite con Room si el elector ya votó
        lifecycleScope.launch {
            val votosPrevios = db.votoDao().yaVoto(documento)
            if (votosPrevios > 0) {
                Toast.makeText(
                    this@MainActivity,
                    "Elector no habilitado: El documento N.° $documento ya ejerció su voto en esta elección.",
                    Toast.LENGTH_LONG
                ).show()
            } else {
                // Elector habilitado: Navegar mediante Intent a VotacionActivity
                val intent = Intent(this@MainActivity, VotacionActivity::class.java).apply {
                    putExtra("EXTRA_DOCUMENTO", documento)
                    putExtra("EXTRA_EDAD", edad)
                }
                startActivity(intent)
            }
        }
    }

    override fun onResume() {
        super.onResume()
        // Limpiar campos al volver a la pantalla inicial
        etDocumento.text.clear()
        etEdad.text.clear()
    }
}
