import type { BackendStatus } from "~/schemas/volumes";
import type { Volume } from "../../db/schema";
import { getVolumePath } from "../volumes/helpers";
import { makeDirectoryBackend } from "./directory/directory-backend";
import { makeNfsBackend } from "./nfs/nfs-backend";
import { makeRcloneBackend } from "./rclone/rclone-backend";
import { makeSmbBackend } from "./smb/smb-backend";
import { makeWebdavBackend } from "./webdav/webdav-backend";
import { makeSftpBackend } from "./sftp/sftp-backend";

type OperationResult = {
	error?: string;
	status: BackendStatus;
};

export type VolumeBackend = {
	mount: () => Promise<OperationResult>;
	unmount: () => Promise<OperationResult>;
	checkHealth: () => Promise<OperationResult>;
};

export const createVolumeBackend = (volume: Volume, mountPath = getVolumePath(volume)): VolumeBackend => {
	switch (volume.config.backend) {
		case "nfs": {
			return makeNfsBackend(volume.config, mountPath);
		}
		case "smb": {
			return makeSmbBackend(volume.config, mountPath);
		}
		case "directory": {
			return makeDirectoryBackend(volume.config, mountPath);
		}
		case "webdav": {
			return makeWebdavBackend(volume.config, mountPath);
		}
		case "rclone": {
			return makeRcloneBackend(volume.config, mountPath);
		}
		case "sftp": {
			return makeSftpBackend(volume.config, mountPath);
		}
		default: {
			throw new Error("Unsupported backend");
		}
	}
};
