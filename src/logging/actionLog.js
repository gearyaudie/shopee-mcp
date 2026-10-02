// Append-only audit log for every automated write (sales sync writes and ad
// changes alike): timestamp, tool, target id, old value, new value, which
// gate justified it, and whether it was Claude-initiated autonomously or
// user-approved in conversation.
//
// TODO: pick a storage target (local JSONL file under secrets/ or logs/, or
// a dedicated sheet tab) and implement logAction(entry) / readRecentActions().
