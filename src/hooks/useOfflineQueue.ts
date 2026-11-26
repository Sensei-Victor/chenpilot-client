import { useEffect, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  queueMessage,
  dequeueMessage,
  sendMessage,
  isQueuedMessageExpired,
} from '@/store/slices/chatSlice';
import toast from 'react-hot-toast';

export const useOfflineQueue = () => {
  const dispatch = useAppDispatch();
  const { isOnline, messageQueue, error } = useAppSelector((state) => state.chat);

  useEffect(() => {
    if (error && /offline .*unavailable|browser storage is full|expired offline data/i.test(error)) {
      toast.error(error, { id: 'offline-storage-quota' });
    }
  }, [error]);

  // Guards against replaying the queue twice when online/offline events repeat (#290)
  const processingRef = useRef(false);

  const processQueue = useCallback(async () => {
    if (processingRef.current) return;
    processingRef.current = true;
    const queueCopy = [...messageQueue];

    try {
      for (const queuedMsg of queueCopy) {
        // Never replay a stale prompt (#290)
        if (isQueuedMessageExpired(queuedMsg)) {
          dispatch(dequeueMessage(queuedMsg.id));
          continue;
        }
        try {
          // Send with the queued row's id so it moves queued → sending → sent instead of a
          // second bubble being added (#266)
          await dispatch(sendMessage({ query: queuedMsg.query, tempId: queuedMsg.id })).unwrap();

          // Remove from queue
          dispatch(dequeueMessage(queuedMsg.id));

          toast.success('Queued message sent');
        } catch (error: any) {
          // The row is now `failed` with a retry action; drop it from the automatic queue
          dispatch(dequeueMessage(queuedMsg.id));
          const errorMsg = error instanceof Error ? error.message : String(error);
          toast.error(`Failed to send queued message: ${errorMsg}`);
        }
      }

      if (queueCopy.length > 0) {
        toast.success(`All ${queueCopy.length} queued message${queueCopy.length !== 1 ? 's' : ''} sent!`);
      }
    } finally {
      processingRef.current = false;
    }
  }, [messageQueue, dispatch]);

  // Process queued messages when coming back online. Declared after processQueue: the
  // dependency array is evaluated during render, so referencing it earlier throws (#290)
  useEffect(() => {
    if (isOnline && messageQueue.length > 0) {
      processQueue();
    }
  }, [isOnline, messageQueue.length, processQueue]);

  const queueMessageForSending = useCallback(
    (query: string) => {
      const msgId = `queued_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      dispatch(
        queueMessage({
          id: msgId,
          query,
        })
      );
      return msgId;
    },
    [dispatch]
  );

  return {
    isOnline,
    messageQueue,
    queueMessageForSending,
    processQueue,
  };
};
