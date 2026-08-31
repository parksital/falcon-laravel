import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type ChangeEvent,
    type DragEvent,
    type InputHTMLAttributes,
    type Ref,
} from 'react';

export type FileMetadata = {
    name: string;
    size: number;
    type: string;
    url: string;
    id: string;
};

export type FileWithPreview = {
    file: File | FileMetadata;
    id: string;
    preview?: string;
};

export type FileUploadOptions = {
    maxFiles?: number;
    maxSize?: number;
    accept?: string;
    multiple?: boolean;
    initialFiles?: FileMetadata[];
    onFilesChange?: (files: FileWithPreview[]) => void;
    onFilesAdded?: (addedFiles: FileWithPreview[]) => void;
};

export type FileUploadState = {
    files: FileWithPreview[];
    isDragging: boolean;
    errors: string[];
    isProcessing: boolean;
    processedFiles: number;
    totalFiles: number;
    progress: number;
};

export type FileUploadActions = {
    addFiles: (files: FileList | File[]) => void;
    removeFile: (id: string) => void;
    clearFiles: () => void;
    clearErrors: () => void;
    handleDragEnter: (event: DragEvent<HTMLElement>) => void;
    handleDragLeave: (event: DragEvent<HTMLElement>) => void;
    handleDragOver: (event: DragEvent<HTMLElement>) => void;
    handleDrop: (event: DragEvent<HTMLElement>) => void;
    handleFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
    openFileDialog: () => void;
    getInputProps: (
        props?: InputHTMLAttributes<HTMLInputElement>,
    ) => InputHTMLAttributes<HTMLInputElement> & {
        ref: Ref<HTMLInputElement>;
    };
};

function revokeFilePreview(file: FileWithPreview) {
    if (file.preview && file.file instanceof File && file.file.type.startsWith('image/')) {
        URL.revokeObjectURL(file.preview);
    }
}

export function useFileUpload(options: FileUploadOptions = {}): [FileUploadState, FileUploadActions] {
    const {
        maxFiles = Infinity,
        maxSize = Infinity,
        accept = '*',
        multiple = false,
        initialFiles = [],
        onFilesChange,
        onFilesAdded,
    } = options;

    const [state, setState] = useState<FileUploadState>({
        files: initialFiles.map((file) => ({
            file,
            id: file.id,
            preview: file.url,
        })),
        isDragging: false,
        errors: [],
        isProcessing: false,
        processedFiles: 0,
        totalFiles: 0,
        progress: 0,
    });

    const inputRef = useRef<HTMLInputElement>(null);
    const processingSessionRef = useRef(0);
    const filesRef = useRef(state.files);

    useEffect(() => {
        filesRef.current = state.files;
    }, [state.files]);

    useEffect(() => () => {
        processingSessionRef.current += 1;
        filesRef.current.forEach(revokeFilePreview);
    }, []);

    const validateFile = useCallback(
        (file: File | FileMetadata): string | null => {
            if (file.size > maxSize) {
                return `File "${file.name}" exceeds the maximum size of ${formatBytes(maxSize)}.`;
            }

            if (accept !== '*') {
                const acceptedTypes = accept.split(',').map((type) => type.trim());
                const fileType = file instanceof File ? file.type || '' : file.type;
                const fileExtension = `.${file.name.split('.').pop()}`;

                const isAccepted = acceptedTypes.some((type) => {
                    if (type.startsWith('.')) {
                        return fileExtension.toLowerCase() === type.toLowerCase();
                    }

                    if (type.endsWith('/*')) {
                        const baseType = type.split('/')[0];
                        return fileType.startsWith(`${baseType}/`);
                    }

                    return fileType === type;
                });

                if (! isAccepted) {
                    return `File "${file.name}" is not an accepted file type.`;
                }
            }

            return null;
        },
        [accept, maxSize],
    );

    const createPreview = useCallback((file: File | FileMetadata): string | undefined => {
        if (! (file instanceof File)) {
            return file.url;
        }

        return URL.createObjectURL(file);
    }, []);

    const generateUniqueId = useCallback((file: File | FileMetadata): string => {
        if (file instanceof File) {
            return `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        }

        return file.id;
    }, []);

    const clearFiles = useCallback(() => {
        processingSessionRef.current += 1;

        setState((previousState) => {
            previousState.files.forEach(revokeFilePreview);

            if (inputRef.current) {
                inputRef.current.value = '';
            }

            const newState = {
                ...previousState,
                files: [],
                errors: [],
                isProcessing: false,
                processedFiles: 0,
                totalFiles: 0,
                progress: 0,
            };

            onFilesChange?.(newState.files);

            return newState;
        });
    }, [onFilesChange]);

    const addFiles = useCallback(
        (newFiles: FileList | File[]) => {
            if (! newFiles || newFiles.length === 0) {
                return;
            }

            const sessionId = ++processingSessionRef.current;

            void (async () => {
                const newFilesArray = Array.from(newFiles);
                const errors: string[] = [];
                const addedFiles: FileWithPreview[] = [];
                let addedCount = 0;
                let processedCount = 0;

                const isSessionActive = () => processingSessionRef.current === sessionId;
                const duplicateKeys = new Set(
                    multiple ? state.files.map((existingFile) => `${existingFile.file.name}:${existingFile.file.size}`) : [],
                );

                setState((previousState) => {
                    if (! isSessionActive()) {
                        return previousState;
                    }

                    if (! multiple) {
                        previousState.files.forEach(revokeFilePreview);
                    }

                    return {
                        ...previousState,
                        files: multiple ? previousState.files : [],
                        errors: [],
                        isProcessing: true,
                        processedFiles: 0,
                        totalFiles: newFilesArray.length,
                        progress: newFilesArray.length > 0 ? 0 : 100,
                    };
                });

                for (const file of newFilesArray) {
                    if (! isSessionActive()) {
                        return;
                    }

                    if (multiple) {
                        const duplicateKey = `${file.name}:${file.size}`;
                        const isDuplicate = duplicateKeys.has(duplicateKey);

                        if (isDuplicate) {
                            processedCount += 1;
                            setState((previousState) => {
                                if (! isSessionActive()) {
                                    return previousState;
                                }

                                return {
                                    ...previousState,
                                    processedFiles: processedCount,
                                    progress: Math.round((processedCount / newFilesArray.length) * 100),
                                };
                            });
                            continue;
                        }
                    }

                    if (multiple && maxFiles !== Infinity && state.files.length + addedCount >= maxFiles) {
                        errors.push(`You can only upload a maximum of ${maxFiles} files.`);
                        processedCount = newFilesArray.length;
                        setState((previousState) => {
                            if (! isSessionActive()) {
                                return previousState;
                            }

                            return {
                                ...previousState,
                                processedFiles: processedCount,
                                progress: 100,
                            };
                        });
                        break;
                    }

                    const error = validateFile(file);

                    if (error) {
                        errors.push(error);
                        processedCount += 1;
                        setState((previousState) => {
                            if (! isSessionActive()) {
                                return previousState;
                            }

                            return {
                                ...previousState,
                                processedFiles: processedCount,
                                progress: Math.round((processedCount / newFilesArray.length) * 100),
                            };
                        });
                        continue;
                    }

                    await new Promise<void>((resolve) => setTimeout(resolve, 0));

                    const preview = createPreview(file);

                    if (! isSessionActive()) {
                        if (preview && file instanceof File) {
                            URL.revokeObjectURL(preview);
                        }

                        return;
                    }

                    const nextFile: FileWithPreview = {
                        file,
                        id: generateUniqueId(file),
                        preview,
                    };

                    addedFiles.push(nextFile);
                    addedCount += 1;
                    duplicateKeys.add(`${file.name}:${file.size}`);

                    setState((previousState) => {
                        if (! isSessionActive()) {
                            return previousState;
                        }

                        const files = ! multiple ? [nextFile] : [...previousState.files, nextFile];

                        onFilesChange?.(files);

                        return {
                            ...previousState,
                            files,
                        };
                    });

                    processedCount += 1;
                    setState((previousState) => {
                        if (! isSessionActive()) {
                            return previousState;
                        }

                        return {
                            ...previousState,
                            processedFiles: processedCount,
                            progress: Math.round((processedCount / newFilesArray.length) * 100),
                        };
                    });

                    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

                    if (! multiple) {
                        break;
                    }
                }

                if (! isSessionActive()) {
                    return;
                }

                if (addedFiles.length > 0) {
                    onFilesAdded?.(addedFiles);
                }

                if (errors.length > 0) {
                    setState((previousState) => {
                        if (! isSessionActive()) {
                            return previousState;
                        }

                        return {
                            ...previousState,
                            errors,
                        };
                    });
                }

                setState((previousState) => {
                    if (! isSessionActive()) {
                        return previousState;
                    }

                    return {
                        ...previousState,
                        isProcessing: false,
                        progress: previousState.totalFiles > 0 ? 100 : 0,
                    };
                });

                if (inputRef.current) {
                    inputRef.current.value = '';
                }
            })();
        },
        [
            state.files,
            maxFiles,
            multiple,
            validateFile,
            createPreview,
            generateUniqueId,
            onFilesChange,
            onFilesAdded,
        ],
    );

    const removeFile = useCallback(
        (id: string) => {
            setState((previousState) => {
                const fileToRemove = previousState.files.find((file) => file.id === id);

                if (fileToRemove) {
                    revokeFilePreview(fileToRemove);
                }

                const files = previousState.files.filter((file) => file.id !== id);

                onFilesChange?.(files);

                return {
                    ...previousState,
                    files,
                    errors: [],
                    isProcessing: false,
                    processedFiles: 0,
                    totalFiles: 0,
                    progress: 0,
                };
            });
        },
        [onFilesChange],
    );

    const clearErrors = useCallback(() => {
        setState((previousState) => ({
            ...previousState,
            errors: [],
            isProcessing: false,
            processedFiles: 0,
            totalFiles: 0,
            progress: 0,
        }));
    }, []);

    const handleDragEnter = useCallback((event: DragEvent<HTMLElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setState((previousState) => ({ ...previousState, isDragging: true }));
    }, []);

    const handleDragLeave = useCallback((event: DragEvent<HTMLElement>) => {
        event.preventDefault();
        event.stopPropagation();

        if (event.currentTarget.contains(event.relatedTarget as Node)) {
            return;
        }

        setState((previousState) => ({ ...previousState, isDragging: false }));
    }, []);

    const handleDragOver = useCallback((event: DragEvent<HTMLElement>) => {
        event.preventDefault();
        event.stopPropagation();
    }, []);

    const handleDrop = useCallback(
        (event: DragEvent<HTMLElement>) => {
            event.preventDefault();
            event.stopPropagation();
            setState((previousState) => ({ ...previousState, isDragging: false }));

            if (inputRef.current?.disabled) {
                return;
            }

            if (! event.dataTransfer.files || event.dataTransfer.files.length === 0) {
                return;
            }

            addFiles(! multiple ? [event.dataTransfer.files[0]] : event.dataTransfer.files);
        },
        [addFiles, multiple],
    );

    const handleFileChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            if (event.target.files && event.target.files.length > 0) {
                addFiles(event.target.files);
            }
        },
        [addFiles],
    );

    const openFileDialog = useCallback(() => {
        inputRef.current?.click();
    }, []);

    const getInputProps = useCallback(
        (props: InputHTMLAttributes<HTMLInputElement> = {}) => ({
            ...props,
            type: 'file' as const,
            onChange: handleFileChange,
            accept: props.accept || accept,
            multiple: props.multiple !== undefined ? props.multiple : multiple,
            ref: inputRef,
        }),
        [accept, multiple, handleFileChange],
    );

    return [
        state,
        {
            addFiles,
            removeFile,
            clearFiles,
            clearErrors,
            handleDragEnter,
            handleDragLeave,
            handleDragOver,
            handleDrop,
            handleFileChange,
            openFileDialog,
            getInputProps,
        },
    ];
}

export function formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) {
        return '0 Bytes';
    }

    const k = 1000;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = [' Bytes', ' KB', ' MB', ' GB', ' TB', ' PB', ' EB', ' ZB', ' YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + sizes[i];
}
