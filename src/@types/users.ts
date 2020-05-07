export type Collaborator = {
    id: string;
    item?: UserMini | GroupMini;
    name: string;
};

export type UserMini = {
    avatar_url?: string;
    email?: string;
    id: string;
    login?: string;
    name: string;
    type: 'user';
};

export type GroupMini = {
    id: string;
    name: string;
    type: 'group';
};
