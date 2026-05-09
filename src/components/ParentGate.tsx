import { useState } from 'react';
import { ConfirmDialog } from './ConfirmDialog';

interface ParentGateProps {
  open: boolean;
  title: string;
  message: string;
  onPass: () => void;
  onCancel: () => void;
}

export function ParentGate({ open, title, message, onPass, onCancel }: ParentGateProps) {
  const [answer, setAnswer] = useState('');
  const challenge = { left: 4, right: 3, result: 7 };

  return (
    <ConfirmDialog
      open={open}
      title={title}
      danger
      confirmText="继续"
      onCancel={() => {
        setAnswer('');
        onCancel();
      }}
      onConfirm={() => {
        if (Number(answer) === challenge.result) {
          setAnswer('');
          onPass();
        }
      }}
      message={
        <div className="gate-content">
          <p>{message}</p>
          <label>
            家长门禁：{challenge.left} + {challenge.right} =
            <input
              inputMode="numeric"
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              placeholder="答案"
            />
          </label>
        </div>
      }
    />
  );
}
