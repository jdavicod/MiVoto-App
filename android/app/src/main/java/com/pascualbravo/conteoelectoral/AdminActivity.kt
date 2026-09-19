package com.pascualbravo.conteoelectoral

import android.content.Context
import android.os.Bundle
import android.widget.*
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.pascualbravo.conteoelectoral.data.AppDatabase
import com.pascualbravo.conteoelectoral.data.Voto
import kotlinx.coroutines.launch

/**
 * Activity del Módulo Administrador
 * Cubre:
 * - HU-06: Configuración del número total de electores habilitados (Censo).
 * - HU-07: Listado de votos registrados (auditoría en tiempo real).
 * - HU-08: Eliminar un voto de la lista sin opción de editar, recalculando de inmediato.
 * - HU-09: Consulta de resultados por candidato y determinación de ganador o empate.
 * - HU-10: Diferencia de votos del ganador respecto al segundo lugar (o 0 en empate).
 */
class AdminActivity : AppCompatActivity() {

    private lateinit var etCenso: EditText
    private lateinit var btnGuardarCenso: Button
    private lateinit var tvResultados: TextView
    private lateinit var tvDiferencia: TextView
    private lateinit var lvVotos: ListView
    private lateinit var btnVolverVotacion: Button

    private lateinit var db: AppDatabase
    private var listaVotos = listOf<Voto>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_admin)

        etCenso = findViewById(R.id.etCenso)
        btnGuardarCenso = findViewById(R.id.btnGuardarCenso)
        tvResultados = findViewById(R.id.tvResultados)
        tvDiferencia = findViewById(R.id.tvDiferencia)
        lvVotos = findViewById(R.id.lvVotos)
        btnVolverVotacion = findViewById(R.id.btnVolverVotacion)

        db = AppDatabase.getDatabase(this)
        val sharedPrefs = getSharedPreferences("ConteoElectoralPrefs", Context.MODE_PRIVATE)

        // HU-06: Cargar censo previamente configurado
        val censoActual = sharedPrefs.getInt("CENSO_TOTAL_ELECTORES", 0)
        if (censoActual > 0) {
            etCenso.setText(censoActual.toString())
        }

        // HU-06: Guardar número total de electores
        btnGuardarCenso.setOnClickListener {
            val valorTexto = etCenso.text.toString().trim()
            if (valorTexto.isEmpty()) {
                etCenso.error = "Debe ingresar el número de electores"
                return@setOnClickListener
            }

            val censo = valorTexto.toIntOrNull()
            if (censo == null || censo <= 0) {
                etCenso.error = "El número debe ser un entero positivo"
                return@setOnClickListener
            }

            sharedPrefs.edit().putInt("CENSO_TOTAL_ELECTORES", censo).apply()
            Toast.makeText(this, "Censo configurado con éxito: $censo electores.", Toast.LENGTH_SHORT).show()
            cargarResultadosYVotos()
        }

        // HU-08: Eliminar voto seleccionado (sin poder editarlo)
        lvVotos.setOnItemClickListener { _, _, position, _ ->
            if (position in listaVotos.indices) {
                val votoAEliminar = listaVotos[position]
                val nombreCandidato = obtenerNombreCandidato(votoAEliminar.idCandidato)

                AlertDialog.Builder(this)
                    .setTitle("Eliminar Voto (Auditoría)")
                    .setMessage("¿Desea anular y eliminar el voto con Folio #${votoAEliminar.id} ($nombreCandidato)?\nEsta acción es irreversible y actualizará el conteo inmediatamente.")
                    .setPositiveButton("Eliminar") { _, _ ->
                        lifecycleScope.launch {
                            db.votoDao().eliminarVoto(votoAEliminar)
                            Toast.makeText(this@AdminActivity, "Voto #${votoAEliminar.id} eliminado.", Toast.LENGTH_SHORT).show()
                            cargarResultadosYVotos() // Recalcula al instante (HU-08, HU-09, HU-10)
                        }
                    }
                    .setNegativeButton("Cancelar", null)
                    .show()
            }
        }

        btnVolverVotacion.setOnClickListener {
            finish()
        }

        solicitarLoginAdmin()
    }

    private fun solicitarLoginAdmin() {
        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(50, 40, 50, 10)
        }

        val etUsuario = EditText(this).apply {
            hint = "Usuario (admin)"
        }
        val etPassword = EditText(this).apply {
            hint = "Contraseña (admin)"
            inputType = android.text.InputType.TYPE_CLASS_TEXT or android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD
        }

        layout.addView(etUsuario)
        layout.addView(etPassword)

        AlertDialog.Builder(this)
            .setTitle("Acceso Restringido")
            .setMessage("Ingrese usuario y contraseña de administrador:")
            .setView(layout)
            .setCancelable(false)
            .setPositiveButton("Ingresar") { _, _ ->
                val user = etUsuario.text.toString().trim()
                val pass = etPassword.text.toString()
                if (user == "admin" && pass == "admin") {
                    Toast.makeText(this, "Acceso concedido al Módulo Administrador.", Toast.LENGTH_SHORT).show()
                    cargarResultadosYVotos()
                } else {
                    Toast.makeText(this, "Credenciales incorrectas. Acceso denegado.", Toast.LENGTH_LONG).show()
                    finish()
                }
            }
            .setNegativeButton("Cancelar") { _, _ ->
                finish()
            }
            .show()
    }

    private fun cargarResultadosYVotos() {
        lifecycleScope.launch {
            // HU-09: Conteo individual de votos por candidato desde SQLite
            val votosC1 = db.votoDao().contarVotosPorCandidato(1)
            val votosC2 = db.votoDao().contarVotosPorCandidato(2)
            val votosC3 = db.votoDao().contarVotosPorCandidato(3)
            val totalVotos = votosC1 + votosC2 + votosC3

            val sharedPrefs = getSharedPreferences("ConteoElectoralPrefs", Context.MODE_PRIVATE)
            val censo = sharedPrefs.getInt("CENSO_TOTAL_ELECTORES", 0)

            val participacionTexto = if (censo > 0) {
                val porcentaje = (totalVotos.toDouble() / censo.toDouble()) * 100
                "Participación: ${"%.1f".format(porcentaje)}% ($totalVotos de $censo electores)"
            } else {
                "Censo no configurado aún"
            }

            tvResultados.text = "Boletín Electoral:\n" +
                    "• 01. Carlos Alberto Gómez: $votosC1 voto(s)\n" +
                    "• 02. María Fernanda Restrepo: $votosC2 voto(s)\n" +
                    "• 03. Andrés Felipe Morales: $votosC3 voto(s)\n\n" +
                    "Total votos en urna: $totalVotos\n$participacionTexto"

            // HU-09 y HU-10: Determinación de Ganador o Empate y Cálculo de Diferencia
            if (totalVotos == 0) {
                tvDiferencia.text = "Estado: No hay votos registrados en la urna todavía."
            } else {
                val candidatos = listOf(
                    "Carlos Alberto Gómez (01)" to votosC1,
                    "María Fernanda Restrepo (02)" to votosC2,
                    "Andrés Felipe Morales (03)" to votosC3
                ).sortedByDescending { it.second }

                val primero = candidatos[0]
                val segundo = candidatos[1]

                if (primero.second == segundo.second) {
                    // Criterios HU-09 y HU-10: Caso de empate técnico
                    tvDiferencia.text = "RESULTADO: EMPATE TÉCNICO\n" +
                            "Hay igualdad entre los candidatos con mayor votación (${primero.second} votos).\n" +
                            "Diferencia de votos: 0"
                } else {
                    // Criterios HU-09 y HU-10: Ganador y diferencia con el 2do lugar
                    val diferencia = primero.second - segundo.second
                    tvDiferencia.text = "CANDIDATO GANADOR:\n${primero.first} con ${primero.second} votos.\n" +
                            "Diferencia sobre el 2.° lugar (${segundo.first}): +$diferencia voto(s)"
                }
            }

            // HU-07: Listado de votos registrados
            listaVotos = db.votoDao().obtenerTodosLosVotos()
            if (listaVotos.isEmpty()) {
                lvVotos.adapter = ArrayAdapter(
                    this@AdminActivity,
                    android.R.layout.simple_list_item_1,
                    listOf("La urna está vacía. No existen votos registrados.")
                )
            } else {
                val itemsTexto = listaVotos.map { v ->
                    val nom = obtenerNombreCandidato(v.idCandidato)
                    "Folio #${v.id} | Elector: ${v.documentoElector} | Candidato: $nom"
                }
                lvVotos.adapter = ArrayAdapter(
                    this@AdminActivity,
                    android.R.layout.simple_list_item_1,
                    itemsTexto
                )
            }
        }
    }

    private fun obtenerNombreCandidato(id: Int): String {
        return when (id) {
            1 -> "01. Carlos Alberto Gómez"
            2 -> "02. María Fernanda Restrepo"
            3 -> "03. Andrés Felipe Morales"
            else -> "Desconocido"
        }
    }
}
