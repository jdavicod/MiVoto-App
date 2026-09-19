package com.pascualbravo.conteoelectoral.data

import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * Entidad Room para representar un voto registrado en SQLite.
 */
@Entity(tableName = "votos")
data class Voto(
    @PrimaryKey(autoGenerate = true)
    val id: Int = 0,
    val documentoElector: String,
    val edad: Int,
    val idCandidato: Int, // 1: Carlos Gómez, 2: María Restrepo, 3: Andrés Morales
    val fechaHora: Long = System.currentTimeMillis()
)
