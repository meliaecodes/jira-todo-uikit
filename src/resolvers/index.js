import Resolver from '@forge/resolver';
import { storage } from '@forge/api';
import { CodeBlock } from '@forge/react';

const resolver = new Resolver();

const getUniqueId = () => '_' + Math.random().toString(36).substr(2, 9);

const getListKeyFromContext = (context) => {
  const { localId: id } = context;
  return id.split('/')[id.split('/').length - 1];
}

const getAll = async (listId) => {
  return await storage.get(listId) || [];
}

resolver.define('get-all', (req) => {
  return getAll(getListKeyFromContext(req.context));
});

resolver.define('create', async (req) => {
  if(req.payload.data.target.value !== "") {
    const listId = getListKeyFromContext(req.context);
    const records = await getAll(listId);
    const id = getUniqueId();
  
    const newRecord = {
      id: id,
      title:  req.payload.data.target.value,
      done: false,
    };
  
    await storage.set(getListKeyFromContext(req.context), [...records, newRecord]);
    return newRecord;
  } else {
    console.log('returning nothing')
    return "";
  }

});

resolver.define('update', async (req) => {
  let updatedRecord = req.payload.item;

  if(req.payload.event.target.type === "text")  {
    if(req.payload.event.target.value !== "") {
      updatedRecord.title = req.payload.event.target.value;
    } else {
      return ""
    }
  }

  if(req.payload.event.target.type === "checkbox")  {
    updatedRecord.done = req.payload.event.target.checked;
  }

  const listId = getListKeyFromContext(req.context);
  let records = await getAll(listId);

  records = records.map(item => {
    if (item.id === req.payload.item.id) {
      return updatedRecord;
    }
    return item;
  })
  await storage.set(getListKeyFromContext(req.context), records);

  return updatedRecord;
});

resolver.define('delete', async (req) => {
  const listId = getListKeyFromContext(req.context);
  let records = await getAll(listId);

  records = records.filter(item => item.id !== req.payload.item.id)

  await storage.set(getListKeyFromContext(req.context), records);

  return req.payload.item;
});

resolver.define('delete-all', async (req) => {

  await storage.set(getListKeyFromContext(req.context), []);
  return []
});

export const handler = resolver.getDefinitions();
