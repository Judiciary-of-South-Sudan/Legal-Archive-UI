import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import apiClient from '@/lib/apiClient';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

type Collection = 'laws' | 'judgments' | 'notices';

interface Props {
  id: string;
  collection: Collection;
  current: string;
  onChanged: () => void;
}

const DocStatusDropdown = ({ id, collection, current, onChanged }: Props) => {
  const [value, setValue] = useState(current || 'DRAFT');
  const [loading, setLoading] = useState(false);

  const triggerClass = {
    DRAFT: 'border-yellow-300 text-yellow-800 bg-yellow-50 hover:bg-yellow-100',
    UNDER_REVIEW: 'border-blue-300 text-blue-800 bg-blue-50 hover:bg-blue-100',
    PUBLISHED: 'border-green-300 text-green-800 bg-green-50 hover:bg-green-100',
  }[value] ?? '';

  const onChange = async (status: string) => {
    const prev = value;
    setValue(status);
    setLoading(true);
    try {
      await apiClient.put(`/admin/${collection}/${id}/status`, { verificationStatus: status });
      toast.success(`Status → ${status.replace('_', ' ')}`);
      onChanged();
    } catch {
      toast.error('Failed to update status');
      setValue(prev);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {loading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground shrink-0" />}
      <Select value={value} onValueChange={onChange} disabled={loading}>
        <SelectTrigger className={`h-6 text-xs px-2 w-32 font-medium rounded-full border ${triggerClass}`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="DRAFT" className="text-xs">Draft</SelectItem>
          <SelectItem value="UNDER_REVIEW" className="text-xs">Under Review</SelectItem>
          <SelectItem value="PUBLISHED" className="text-xs">Published</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default DocStatusDropdown;
