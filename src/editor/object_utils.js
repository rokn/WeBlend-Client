export const traverseNodesDFS = (root, cb) => {
    for (const child of root.children) {
        traverseNodesDFS(child, cb);
    }

    cb(root);
}
