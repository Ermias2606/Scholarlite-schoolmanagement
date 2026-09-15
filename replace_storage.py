import re

with open('src/utils/storage.ts', 'r') as f:
    content = f.read()

replacement = """export async function loadAppDataFromCloud(): Promise<{ data: AppData, success: boolean }> {
  const path = 'schools/default_school';
  try {
    const docRef = doc(db, path);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { data: docSnap.data() as AppData, success: true };
    } else {
      await setDoc(docRef, DEFAULT_APP_DATA);
      return { data: DEFAULT_APP_DATA, success: true };
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
    return { data: DEFAULT_APP_DATA, success: false };
  }
}

export async function saveAppDataToCloud(data: AppData): Promise<boolean> {
  const path = 'schools/default_school';
  try {
    const docRef = doc(db, path);
    await setDoc(docRef, data);
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
    return false;
  }
}"""

content = re.sub(
    r'export async function loadAppDataFromCloud\(\): Promise<AppData> \{.*?\n\}\n\nexport async function saveAppDataToCloud.*?\}\n',
    replacement + '\n',
    content,
    flags=re.DOTALL
)

with open('src/utils/storage.ts', 'w') as f:
    f.write(content)
