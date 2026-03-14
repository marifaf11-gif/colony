"use client";

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { getRecentLogs, subscribeToLogs } from '@/lib/agents/terminal-logger';
import type { TerminalLog, AgentName } from '@/lib/agents/types';
import { Terminal, ChevronDown, ChevronUp } from 'lucide-react';

const AGENT_COLORS: Record<AgentName, string> = {
  HOUND: '#39FF14',
  HAWK: '#4A9EFF',
  GENERAL: '#FFB830',
  SYSTEM: '#888888',
  ARSENAL: '#FF69B4',
};

const EVENT_COLORS: Record<string, string> = {
  VULN_FOUND: '#FF4500',
  TARGET_ACQUIRED: '#4A9EFF',
  TICKET_GENERATED: '#FFD700',
  REPORT_SENT: '#39FF14',
  BOOT: '#888',
  SCAN_START: '#39FF14',
  BUDGET_CHECK: '#FFB830',
  RATE_LIMIT: '#FF4500',
  WEAPON_SELECTED: '#FF69B4',
  DISCORD_SENT: '#4A9EFF',
  ERROR: '#FF0000',
  COMPLETE: '#39FF14',
};

const BOOT_LOGS: TerminalLog[] = [
  {
    id: 'boot-0',
    agent: 'SYSTEM',
    event_type: 'BOOT',
    message: 'Colony OS Strike Engine v2.0 — Initialising...',
    target_url: null,
    vulnerability_id: null,
    metadata: {},
    created_at: new Date(Date.now() - 5000).toISOString(),
  },
  {
    id: 'boot-1',
    agent: 'HOUND',
    event_type: 'BOOT',
    message: 'THE HOUND online — KimiClaw wired. Awaiting target.',
    target_url: null,
    vulnerability_id: null,
    metadata: {},
    created_at: new Date(Date.now() - 4000).toISOString(),
  },
  {
    id: 'boot-2',
    agent: 'HAWK',
    event_type: 'BOOT',
    message: 'THE HAWK online — AntiGravity ready. Monitoring vuln_log.',
    target_url: null,
    vulnerability_id: null,
    metadata: {},
    created_at: new Date(Date.now() - 3000).toISOString(),
  },
  {
    id: 'boot-3',
    agent: 'GENERAL',
    event_type: 'BOOT',
    message: 'THE GENERAL online — Budget watchdog active.',
    target_url: null,
    vulnerability_id: null,
    metadata: {},
    created_at: new Date(Date.now() - 2000).toISOString(),
  },
];

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  } catch {
    return '--:--:--';
  }
}

function LogLine({ log, isNew }: { log: TerminalLog; isNew?: boolean }) {
  const agentColor = AGENT_COLORS[log.agent as AgentName] ?? '#888';
  const eventColor = EVENT_COLORS[log.event_type] ?? '#aaa';

  return (
    <div
      className={cn(
        'flex gap-2 py-0.5 px-2 font-mono text-[11px] leading-5 transition-all duration-300',
        isNew && 'animate-pulse-once'
      )}
      style={{
        background: isNew ? 'rgba(74,158,255,0.05)' : 'transparent',
        borderLeft: isNew ? `2px solid ${agentColor}` : '2px solid transparent',
      }}
    >
      <span className="shrink-0 text-white/20">{formatTime(log.created_at)}</span>
      <span className="shrink-0 font-bold w-16" style={{ color: agentColor }}>
        {log.agent}
      </span>
      <span className="shrink-0 font-bold w-20 text-[10px]" style={{ color: eventColor }}>
        {log.event_type}
      </span>
      <span className="text-white/60 truncate flex-1">{log.message}</span>
    </div>
  );
}

interface AgentTerminalProps {
  className?: string;
}

export function AgentTerminal({ className }: AgentTerminalProps) {
  const [logs, setLogs] = useState<TerminalLog[]>(BOOT_LOGS);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getRecentLogs(30).then((fetched) => {
      if (fetched.length > 0) {
        setLogs([...BOOT_LOGS, ...fetched.reverse()]);
      }
    });

    const unsub = subscribeToLogs((log) => {
      setIsLive(true);
      setLogs((prev) => {
        const next = [...prev, log].slice(-80);
        return next;
      });
      setNewIds((prev) => {
        const next = new Set(prev);
        next.add(log.id);
        setTimeout(() => setNewIds((s) => { const n = new Set(s); n.delete(log.id); return n; }), 2000);
        return next;
      });
    });

    return unsub;
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const visibleLogs = expanded ? logs : logs.slice(-6);

  return (
    <div
      className={cn('rounded-xl overflow-hidden flex flex-col', className)}
      style={{
        background: 'linear-gradient(180deg, #0a0f0a 0%, #06090a 100%)',
        border: '1px solid rgba(57,255,20,0.12)',
        boxShadow: '0 0 20px rgba(57,255,20,0.05)',
      }}
    >
      <div
        className="flex items-center justify-between px-3 py-2 shrink-0"
        style={{ borderBottom: '1px solid rgba(57,255,20,0.08)' }}
      >
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5" style={{ color: '#39FF14' }} />
          <span
            className="text-[10px] font-bold uppercase tracking-[0.2em]"
            style={{ color: '#39FF14' }}
          >
            Agent Terminal
          </span>
          {isLive && (
            <div className="flex items-center gap-1">
              <div
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: '#39FF14', boxShadow: '0 0 4px #39FF14' }}
              />
              <span className="text-[9px] text-white/30">LIVE</span>
            </div>
          )}
        </div>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-white/20 hover:text-white/50 transition-colors"
        >
          {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>
      </div>

      <div
        ref={scrollRef}
        className="overflow-y-auto"
        style={{
          maxHeight: expanded ? '320px' : '120px',
          transition: 'max-height 0.2s ease',
          scrollbarWidth: 'none',
        }}
      >
        <div className="py-1">
          {visibleLogs.map((log) => (
            <LogLine key={log.id} log={log} isNew={newIds.has(log.id)} />
          ))}
        </div>
      </div>

      <div
        className="px-3 py-1.5 shrink-0 flex items-center gap-1.5"
        style={{ borderTop: '1px solid rgba(57,255,20,0.06)' }}
      >
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: '#39FF14', boxShadow: '0 0 4px #39FF14' }}
        />
        <span className="font-mono text-[10px] text-white/20">
          {`> colony-os strike-engine ready_`}
        </span>
      </div>
    </div>
  );
}
