package com.pascualbravo.conteoelectoral.data

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.Query

/**
 * DAO para operaciones de persistencia en SQLite con Room.
 */
@Dao
interface VotoDao {
    /**
     * HU-03: Inserta un nuevo voto en la base de datos local SQLite.
     */
    @Insert
    suspend fun registrarVoto(voto: Voto): Long

    /**
     * HU-07: Obtiene todos los votos registrados para la lista de auditoría.
     */
    @Query("SELECT * FROM votos ORDER BY id DESC")
    suspend fun obtenerTodosLosVotos(): List<Voto>

    /**
     * HU-05: Valida si un elector ya votó previamente con su documento.
     */
    @Query("SELECT COUNT(*) FROM votos WHERE documentoElector = :documento")
    suspend fun yaVoto(documento: String): Int

    /**
     * HU-09: Cuenta el número de votos obtenidos por cada candidato.
     */
    @Query("SELECT COUNT(*) FROM votos WHERE idCandidato = :idCandidato")
    suspend fun contarVotosPorCandidato(idCandidato: Int): Int

    /**
     * HU-08: Elimina un voto de la base de datos sin opción de editar.
     */
    @Delete
    suspend fun eliminarVoto(voto: Voto)
}
