package com.pascualbravo.conteoelectoral

import android.os.Bundle
import android.widget.Button
import android.widget.RadioGroup
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.pascualbravo.conteoelectoral.data.AppDatabase
import com.pascualbravo.conteoelectoral.data.Voto
import kotlinx.coroutines.launch

/**
 * Activity del Tarjetón Electoral
 * Cubre:
 * - HU-03: Selección de uno de los 3 candidatos y registro inmediato del voto en SQLite.
 * - HU-04: Mensaje claro de confirmación tras registrar el voto.
 */
class VotacionActivity : AppCompatActivity() {

    private lateinit var tvDatosElector: TextView
    private lateinit var rgCandidatos: RadioGroup
    private lateinit var btnVotar: Button
    private lateinit var btnCancelar: Button
    private lateinit var db: AppDatabase

    private var documentoElector: String = ""
    private var edadElector: Int = 0

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_votacion)

        documentoElector = intent.getStringExtra("EXTRA_DOCUMENTO") ?: ""
        edadElector = intent.getIntExtra("EXTRA_EDAD", 0)

        tvDatosElector = findViewById(R.id.tvDatosElector)
        rgCandidatos = findViewById(R.id.rgCandidatos)
        btnVotar = findViewById(R.id.btnVotar)
        btnCancelar = findViewById(R.id.btnCancelar)

        tvDatosElector.text = "Elector: $documentoElector • Edad: $edadElector años (Habilitado)"

        db = AppDatabase.getDatabase(this)

        btnVotar.setOnClickListener {
            registrarVoto()
        }

        btnCancelar.setOnClickListener {
            finish()
        }
    }

    private fun registrarVoto() {
        val selectedRadioButtonId = rgCandidatos.checkedRadioButtonId

        // HU-03 Criterio: Dado que no se ha seleccionado ningún candidato, muestra error
        if (selectedRadioButtonId == -1) {
            Toast.makeText(
                this,
                "Debe marcar uno de los 3 candidatos antes de confirmar su voto.",
                Toast.LENGTH_SHORT
            ).show()
            return
        }

        val idCandidato = when (selectedRadioButtonId) {
            R.id.rbCandidato1 -> 1
            R.id.rbCandidato2 -> 2
            R.id.rbCandidato3 -> 3
            else -> 0
        }

        // HU-03: Registro persistente en SQLite con Room
        lifecycleScope.launch {
            val nuevoVoto = Voto(
                documentoElector = documentoElector,
                edad = edadElector,
                idCandidato = idCandidato
            )

            val folioId = db.votoDao().registrarVoto(nuevoVoto)

            // HU-04: Mensaje de confirmación del voto registrado
            AlertDialog.Builder(this@VotacionActivity)
                .setTitle("¡Voto Registrado con Éxito!")
                .setMessage("Certificado de votación emitido.\nFolio: #$folioId\nSu voto ha sido contabilizado legalmente.")
                .setCancelable(false)
                .setPositiveButton("Finalizar") { _, _ ->
                    finish() // Regresa a MainActivity para el siguiente elector
                }
                .show()
        }
    }
}
