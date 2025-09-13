import { Button, Group, Select, Stack, TextInput, Textarea } from '@mantine/core';
import { useState } from 'react';
import { useCreateMissionMutation } from '../../store/missions/missionCreation';

export default function CreateMissionForm({ onDone }: { onDone?: () => void }) {
  const [name, setName] = useState('');
  const [source, setSource] = useState<string | null>('s3');
  const [goal, setGoal] = useState('');
  const [errors, setErrors] = useState<{ name?: string; goal?: string }>({});
  const [create, { isLoading }] = useCreateMissionMutation();

  const submit = async () => {
    const errs: typeof errors = {};
    if (!name.trim()) errs.name = 'Required';
    if (!goal.trim()) errs.goal = 'Required';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    await create({ name, source: source || 's3', goal }).unwrap();
    onDone?.();
  };

  return (
    <Stack>
      <TextInput label="Name" placeholder="Mission name" value={name} onChange={(e) => setName(e.currentTarget.value)} error={errors.name} />
      <Select label="Source" data={[{ value: 's3', label: 'S3' }, { value: 'postgres', label: 'Postgres' }, { value: 'api', label: 'API' }]} value={source} onChange={setSource} />
      <Textarea label="Goal" placeholder="Describe the mission goal" minRows={3} value={goal} onChange={(e) => setGoal(e.currentTarget.value)} error={errors.goal} />
      <Group justify="right">
        <Button loading={isLoading} onClick={submit}>Start Mission</Button>
      </Group>
    </Stack>
  );
}
