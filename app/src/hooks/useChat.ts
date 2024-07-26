import useSWR from "swr";

export const useGetChannels = () => {
    const { data, error, isLoading, mutate } = useSWR("chat/channels");
    
    return {
        channels: data,
        isLoading,
        error,
        mutate,
    };
};

export const useGetChannel = (id: string) => {
    const { data, error, isLoading, mutate } = useSWR(`chat/channel/${id}`);
    
    return {
        channel: data,
        isLoading,
        error,
        mutate,
    };
};

export const useGetChannelPicture = (id: string) => {
    const { data, error, isLoading, mutate } = useSWR(`chat/channel/${id}/picture`);
    
    return {
        picture: data,
        isLoading,
        error,
        mutate,
    };
}

export const useGetChannelMessages = (id: string) => {
    const { data, error, isLoading, mutate } = useSWR(`chat/channel/${id}/messages`);
    
    return {
        messages: data,
        isLoading,
        error,
        mutate,
    };
}

export const useGetDms = () => {
    const { data, error, isLoading, mutate } = useSWR("chat/direct-messages");
    
    return {
        dms: data,
        isLoading,
        error,
        mutate,
    };
};

export const useGetUninitiatedDms = () => {
    const { data, error, isLoading, mutate } = useSWR("chat/direct-messages/uninitiated");
    
    return {
        dms: data,
        isLoading,
        error,
        mutate,
    };
};

export const useGetDm = (id: string) => {
    const { data, error, isLoading, mutate } = useSWR(`chat/direct-messages/${id}`);
    
    return {
        dm: data,
        isLoading,
        error,
        mutate,
    };
};

export const useGetDmMessages = (id: string) => {
    const { data, error, isLoading, mutate } = useSWR(`chat/direct-messages/${id}/messages`);
    
    return {
        messages: data,
        isLoading,
        error,
        mutate,
    };
};

