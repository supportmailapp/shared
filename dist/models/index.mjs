import { Schema } from "mongoose";
//#region src/models/userTokens.ts
/**
* Build the shared `userTokens` schema. The `accessToken` / `refreshToken`
* getters/setters call the injected crypto so ciphertext never leaves the DB
* layer. Consumers still own the `models.UserToken ? model(...) : model(...)`
* singleton guard (per-process, breaks across two mongoose instances — hence
* mongoose is a peerDependency).
*/
function makeUserTokenSchema(opts) {
	const { encrypt, decrypt } = opts;
	return new Schema({
		userId: {
			type: String,
			required: true,
			unique: true
		},
		accessToken: {
			type: String,
			required: true,
			set: (v) => v ? encrypt(v) : v,
			get: (v) => v ? decrypt(v) : v
		},
		refreshToken: {
			type: String,
			default: null,
			set: (v) => v ? encrypt(v) : null,
			get: (v) => v ? decrypt(v) : v
		},
		expiresAt: {
			type: Date,
			required: true
		},
		clearance: {
			type: String,
			enum: ["user", "admin"],
			default: "user"
		}
	}, {
		timestamps: true,
		toJSON: {
			flattenMaps: true,
			flattenObjectIds: true,
			getters: true
		},
		toObject: {
			flattenMaps: true,
			flattenObjectIds: true,
			getters: true
		}
	});
}
//#endregion
export { makeUserTokenSchema };
