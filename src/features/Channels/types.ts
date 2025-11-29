export type ChannelFormData = {
  name: string;
  description: string;
  channelType: 'general' | 'academic' | 'social' | 'announcements' | 'local';
  facultyId?: string;
  specialityId?: string;
};

export type FormState = {
  success: boolean;
  message: string;
  errors?: {
    name?: string[];
    description?: string[];
    channelType?: string[];
    facultyId?: string[];
    specialityId?: string[];
  };
};
