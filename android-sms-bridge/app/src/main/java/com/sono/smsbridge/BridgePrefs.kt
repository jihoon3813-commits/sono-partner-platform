package com.sono.smsbridge

import android.content.Context
import android.content.SharedPreferences
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

data class PendingAckItem(
    val outboxId: String,
    val success: Boolean,
    val errorMessage: String?
)

object BridgePrefs {
    const val APP_VERSION = "1.1.0"

    private const val PREF_NAME = "sono_sms_bridge_prefs"
    const val KEY_SERVER_URL = "server_url"
    const val KEY_SECRET = "secret"
    const val KEY_ENABLED = "enabled"
    const val KEY_LAST_SMS_ID = "last_sms_id"
    const val KEY_LAST_MMS_ID = "last_mms_id"
    const val KEY_LOGS = "activity_logs"
    const val KEY_STATUS_TEXT = "status_text"
    private const val KEY_SENT_OUTBOX_IDS = "sent_outbox_ids"
    private const val KEY_PENDING_ACKS = "pending_acks_json"

    const val DEFAULT_SERVER_URL = "https://successful-marmot-772.convex.site"

    fun prefs(context: Context): SharedPreferences =
        context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)

    fun getServerUrl(context: Context): String {
        val raw = prefs(context).getString(KEY_SERVER_URL, DEFAULT_SERVER_URL) ?: DEFAULT_SERVER_URL
        return raw.trim().trimEnd('/')
    }

    fun getSecret(context: Context): String =
        (prefs(context).getString(KEY_SECRET, "") ?: "").trim()

    fun saveConfig(context: Context, serverUrl: String, secret: String) {
        prefs(context).edit()
            .putString(KEY_SERVER_URL, serverUrl.trim().trimEnd('/'))
            .putString(KEY_SECRET, secret.trim())
            .apply()
    }

    fun isEnabled(context: Context): Boolean =
        prefs(context).getBoolean(KEY_ENABLED, false)

    fun setEnabled(context: Context, enabled: Boolean) {
        prefs(context).edit().putBoolean(KEY_ENABLED, enabled).apply()
    }

    fun getLastSmsId(context: Context): Long =
        prefs(context).getLong(KEY_LAST_SMS_ID, -1L)

    fun setLastSmsId(context: Context, id: Long) {
        prefs(context).edit().putLong(KEY_LAST_SMS_ID, id).apply()
    }

    fun getLastMmsId(context: Context): Long =
        prefs(context).getLong(KEY_LAST_MMS_ID, -1L)

    fun setLastMmsId(context: Context, id: Long) {
        prefs(context).edit().putLong(KEY_LAST_MMS_ID, id).apply()
    }

    fun setStatusText(context: Context, status: String) {
        prefs(context).edit().putString(KEY_STATUS_TEXT, status).apply()
    }

    fun getStatusText(context: Context): String =
        prefs(context).getString(KEY_STATUS_TEXT, "대기 중") ?: "대기 중"

    @Synchronized
    fun wasOutboxSent(context: Context, outboxId: String): Boolean {
        if (outboxId.isBlank()) return false
        val raw = prefs(context).getString(KEY_SENT_OUTBOX_IDS, "") ?: ""
        if (raw.isBlank()) return false
        return raw.split(",").any { it == outboxId }
    }

    @Synchronized
    fun markOutboxSent(context: Context, outboxId: String) {
        if (outboxId.isBlank()) return
        val raw = prefs(context).getString(KEY_SENT_OUTBOX_IDS, "") ?: ""
        val existing = if (raw.isBlank()) emptyList() else raw.split(",").filter { it.isNotBlank() && it != outboxId }
        val updated = (existing + outboxId).takeLast(100).joinToString(",")
        prefs(context).edit().putString(KEY_SENT_OUTBOX_IDS, updated).apply()
    }

    @Synchronized
    fun enqueuePendingAck(context: Context, item: PendingAckItem) {
        val current = getPendingAcks(context).filter { it.outboxId != item.outboxId }
        val next = (current + item).takeLast(40)
        savePendingAcks(context, next)
    }

    @Synchronized
    fun removePendingAck(context: Context, outboxId: String) {
        val current = getPendingAcks(context)
        if (current.none { it.outboxId == outboxId }) return
        savePendingAcks(context, current.filter { it.outboxId != outboxId })
    }

    @Synchronized
    fun getPendingAcks(context: Context): List<PendingAckItem> {
        val raw = prefs(context).getString(KEY_PENDING_ACKS, "") ?: ""
        if (raw.isBlank()) return emptyList()
        return try {
            val arr = JSONArray(raw)
            val list = mutableListOf<PendingAckItem>()
            for (i in 0 until arr.length()) {
                val obj = arr.optJSONObject(i) ?: continue
                val id = obj.optString("outboxId", "")
                if (id.isNotBlank()) {
                    list.add(
                        PendingAckItem(
                            outboxId = id,
                            success = obj.optBoolean("success", false),
                            errorMessage = obj.optString("errorMessage", "").takeIf { it.isNotBlank() }
                        )
                    )
                }
            }
            list
        } catch (_: Exception) {
            emptyList()
        }
    }

    private fun savePendingAcks(context: Context, list: List<PendingAckItem>) {
        val arr = JSONArray()
        for (item in list) {
            arr.put(
                JSONObject().apply {
                    put("outboxId", item.outboxId)
                    put("success", item.success)
                    if (!item.errorMessage.isNullOrBlank()) {
                        put("errorMessage", item.errorMessage)
                    }
                }
            )
        }
        prefs(context).edit().putString(KEY_PENDING_ACKS, arr.toString()).apply()
    }

    @Synchronized
    fun appendLog(context: Context, line: String) {
        val stamp = SimpleDateFormat("HH:mm:ss", Locale.KOREA).format(Date())
        val current = prefs(context).getString(KEY_LOGS, "") ?: ""
        val lines = if (current.isBlank()) emptyList() else current.split("\n")
        val updated = (lines + "[$stamp] $line").takeLast(50).joinToString("\n")
        prefs(context).edit().putString(KEY_LOGS, updated).apply()
    }

    fun getLogs(context: Context): String =
        prefs(context).getString(KEY_LOGS, "아직 기록이 없습니다.") ?: ""
}
