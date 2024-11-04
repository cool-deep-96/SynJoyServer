import bcryptjs from "bcryptjs";

export const hashText = async (text: string): Promise<string> => {
  const salt = await bcryptjs.genSalt(10);
  return await bcryptjs.hash(text, salt);
};
