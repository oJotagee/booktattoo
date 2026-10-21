'use client';

import { useEffect, useRef } from 'react';
import { cn } from 'cn';

import type { ConversationMessage, ParticipantAuthor } from './types';
import { formatMessageDate } from './format-message-date';

interface MessageListProps {
  messages: ConversationMessage[];
  viewer: ParticipantAuthor;
  authorNames: Record<ParticipantAuthor, string>;
  className?: string;
}

export function MessageList({ messages, viewer, authorNames, className }: MessageListProps) {
  const endRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (messages.length === 0) return;
    endRef.current?.scrollIntoView?.({ block: 'nearest' });
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <p className={cn('py-10 text-center text-sm text-white/50', className)}>
        Nenhuma mensagem ainda.
      </p>
    );
  }

  return (
    <ol aria-label="Mensagens" className={cn('flex flex-col gap-3', className)}>
      {messages.map((message) => {
        if (message.author === 'SYSTEM') {
          return (
            <li key={message.id} className="flex flex-col items-center gap-1 py-1 text-center">
              <p className="max-w-[90%] whitespace-pre-wrap break-words rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-xs text-white/60">
                {message.body}
              </p>
              <time dateTime={message.createdAt} className="text-[11px] text-white/30">
                {formatMessageDate(message.createdAt)}
              </time>
            </li>
          );
        }

        const own = message.author === viewer;

        return (
          <li
            key={message.id}
            className={cn('flex flex-col gap-1', own ? 'items-end' : 'items-start')}
          >
            <div
              className={cn(
                'max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm sm:max-w-[75%]',
                own
                  ? 'rounded-br-sm bg-orange-600 text-white'
                  : 'rounded-bl-sm border border-white/10 bg-white/5 text-white/90',
              )}
            >
              {message.body}
            </div>
            <span className="px-1 text-xs text-white/40">
              <span className="capitalize">{own ? 'Você' : authorNames[message.author]}</span> ·{' '}
              <time dateTime={message.createdAt}>{formatMessageDate(message.createdAt)}</time>
            </span>
          </li>
        );
      })}
      <li ref={endRef} aria-hidden className="h-px" />
    </ol>
  );
}
