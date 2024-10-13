---
title: 前端学习之React项目实战Ⅲ
date: 2022-03-18 22:54:43
img: https://cdn.jsdelivr.net/gh/mahoo12138/js-css-cdn/hexo-images/cover/react.png
categories: 
- 学习笔记
tags:
- React
- 前端
---

## 添加项目页面

### 状态提升

按照项目的设计，在 Header ，项目列表以及编辑项目三处都会打开新增项目或者说是编辑项目的 Modal，这些组件都需要这个控制 Modal 的状态，常见的做法是使用状态提升，将其共同需要的状态提升至距离它们最近的父组件中，在项目中是` AuthenticateApp`这个组件，即在此创建一个新的状态：

```react
const [projectModalOpen,setProjectModalOpen] = useState(false)
```

之后即是对于 Modal 组件的大致编写：

```react
export const ProjectModal = (props: {projectModalOpen: boolean,onClose:()=>void}) => {
  return <Drawer onClose={props.onClose} visible={props.projectModalOpen}>
   <h1> Project Modal </h1>
   <Button onClick={props.onClose}>关闭</Button>
  </Drawer>
}
```

然后将`setProjectModalOpen`进行传递：

```react
<Route path={"/projects"} element={<ProjectListPage setProjectModalOpen={setProjectModalOpen} />} />

<List
    ...otherProps
    setProjectModalOpen={props.setProjectModalOpen}
    />

// project list 
{
    render(value,project){
        return <Dropdown overlay={<Menu>
                                      <Menu.Item>
                                          <ButtonNoPadding type={'link'} onClick={()=>props.setProjectModalOpen(true)}>编辑</ButtonNoPadding>
                                      </Menu.Item>
                                  </Menu>}>
            <ButtonNoPadding type={'link'}>...</ButtonNoPadding>
        </Dropdown>
    }
}
```

可以看到 props 这样传输，会根据组件的复杂程度，传递相当多次，这样的现象叫做 **prop drilling**；如此的下钻，使用是没有问题的，但是定义和调用相距太远，导致层级差距太大的组件耦合，如需要修改业务的时候，就需要每一处都做修改；

### 组件组合

React 官网提供一种方案叫做**组件组合**，能够避免这类情况，即它选择 JSX 组件直接作为 props 传入，修改时只需要修改最初的传入值即可：

```react
<PageHeader projectButton={
        <ButtonNoPadding
            type="link"
            onClick={() => setProjectModalOpen(true)}
            >
            创建项目
        </ButtonNoPadding>
     } />
```

### URL管理全局状态

上面演示了常用的两种对于处理状态的模式，但我们都不会采用，而是会使用 URL 来管理，来写个 Hook 吧：

```react
export const useProjectModal = ()=>{
  const [{projectCreate}, setProjectCreate] = useUrlQueryParam([
    'projectCreate'
  ])
  const open = () => setProjectCreate({projectCreate: true})
  const close = () => setProjectCreate({projectCreate: undefined})
  return {
    projectCreate: projectCreate === 'true',
    open,
    close
  }
}
```

这样下来，只需要在需要打开 Modal 组件内，使用该Hook就行了，但是这里有一个小问题：

```error
useLocation() may be used only in the context of a <Router> component.
```

当看到**context**这个字眼时，我们并不应该陌生，类似我们自己创建的`useAuth`中使用的 context，大概率是因为我们使用了`useSearchParams`这个 Hook，其中可能间接使用了`useLocation`，所以我们将用到了`useSearchParams`组件都放到`Router`组件内部，没错，猜测是正确的！

## 处理服务端缓存

### 类型守卫

```react
{error ? (
    <Typography.Text type="danger">{error.message}</Typography.Text>
) : null}
```

对于我们之前对错误的显示，也可以加以优化，如封装一个组件：

```react
// 自定义类型守卫
const isError = (value:any):value is Error  => value?.message

export const ErrorBox = ({error} : {error:unknown})=>{
  if(isError(error)){
    return <Typography.Text type="danger">{error.message}</Typography.Text>
  }
  return null
}
```

对此，可引出**类型守卫**这个概念，其所指的是一种类型推断的行为，能在语句的块级作用域内「收紧」变量的类型，以下是常用的四种：

- 类型判断：`typeof`
- 实例判断：`instanceof`
- 属性判断：`in`
- 字面量相等判断：`==`, `===`, `!=`, `!==`

而我们上面代码中的是形如`{形参} is {类型}`的自定义的类型守卫，通过返回布尔值的条件函数赋予类型守卫的能力；

### 使用 Redux Toolkit 

相较于传统的 React-Redux 状态管理模式，Redux ToolKit 再抽象封装了一层 API ，使得在面对大型状态管理时，更易读和管理：

- **configureStore**：像从 Redux 中创建原始的 createStore 一样创建一个 Redux store 实例，但接受一个命名的选项对象并自动设置 Redux DevTools 扩展。
- **createAction**：接受一个 Action 类型字符串，并返回一个使用该类型的 Action 创建函数。
- **createReducer**：接受初始状态值和 Action 类型的查找表到 reducer 函数，并创建一个处理所有 Action类型的 reducer。
- **createSlice**：接受一个初始状态和一个带有 reducer 名称和函数的查找表，并自动生成 action creator 函数、action 类型字符串和一个 reducer 函数。

```react
import { createSlice } from '@reduxjs/toolkit';
export const initialState = {
  users: [],
  loading: false,
  error: false,
};
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    getUser: (state, action) => {
      state.users = action.payload;
      state.loading = true;
      state.error = false;
    },
    createUser: (state, action) => {
      state.users.unshift(action.payload);
      state.loading = false;
    },
    deleteUser: (state, action) => {
      state.users.filter((user) => user.id !== action.payload.id);
      state.loading = false;
    },
  },
});
// 导出 action 和 reducer
export const { createUser, deleteUser, getUser } = userSlice.actions;
export default userSlice.reducer;
```

相较于传统的redux应用，createSlice 不需要在管理和识别 action，也无需为 action 和 reducer 创建单独的目录进行管理，在导出后引入即可：

```react
import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./features/user/userSlice";
export default configureStore({
 reducer: {
  user: userSlice,
 },
});
```

### 使用 React Query

  `React-Query`是一个基于`React Hooks`的数据请求库，这个库将帮助你获取、同步、更新和**缓存**你的远程数据， 提供两个简单的 hooks，就能完成增删改查等操作；

例如，我们使用`React Query`中的最常用的`useQuery`来改造`useProject	`：

```react
export const useProjects = (param?: Partial<Project>) => {
    const request = useHttp();
    return useQuery<Project[]>(['projects',param],() => request("projects", { data: cleanObject(param || {}) }))
}
```

`useQuery`用于查询数据第一个参数`queryKey`，指定用于查询的 key，当 key 更改时，则会再次自动查询；其次则是返回 Promise 的函数，第三个参数用于操作的配置；

下一个改造的则是`useEditProject`：

```react
export const useEditProject = () => {
  const client = useHttp();
  const queryClient = useQueryClient()

  return useMutation(
    (params: Partial<Project>) => {
      return client(`projects/${params.id}`, {
        method: "PATCH",
        data: params,
      });
    }, {
    onSuccess: () => queryClient.invalidateQueries('projects')
  }
  )
};
```

`useMutation`处理数据的增/删/改，这里比查询多了第三个参数中的`onSuccess`回调，用于更改后刷新列表；其中返回的`mutate`函数，可传入参数和回调函数进行更新数据：

```react
const pinProject = (id: number) => (pin: boolean) => mutate({ id, pin })
```

## 编辑和添加项目

在编辑页面前，我们需要在`useProjectModal`内添加一些东西：

```react
const [{ projectCreate, editingProjectId }, setProjectParam] =
      useUrlQueryParam(["projectCreate", "editingProjectId"]);

const { data: editingProject, isLoading } = useProject(+editingProjectId);

const open = () => setProjectParam({ projectCreate: true });
const close = () =>
setProjectParam({ projectCreate: undefined, editingProjectId: undefined });
const startEdit = (id: number) => setProjectParam({ editingProjectId: id });
```

`editingProjectId`编辑的项目的 id，也选择用 URL 来管理，并且获取到该对应项目的数据；`startEdit`函数用于打开编辑的页面，会将参数 id 设置为待编辑项目；

```react
const { startEdit } = useProjectModal();
const editProject = (id: number) => () => startEdit(id);

<Menu.Item onClick={editProject(project.id)} key={"edit"}>
    编辑
</Menu.Item>
```

再来是编辑页面：

```react
const { projectModalOpen, close, editingProject, isLoading } =
      useProjectModal();
const title = editingProject ? "编辑项目" : "添加项目";

const useMutationProject = editingProject ? useEditProject : useAddProject;
const { isLoading: mutateLoading, mutateAsync, error } = useMutationProject();

const [form] = useForm();
const onFinish = (value: any) => {
    mutateAsync({ ...editingProject, ...value }).then(() => {
        form.resetFields();
        close();
    });
};

useEffect(() => {
    form.setFieldsValue(editingProject);
}, [editingProject, form]);
```

首先拿到`editingProject`看看是否存在，决定是添加还是编辑任务；使用`useForm`创建一个 form 实例用于绑定到 From 表单，继续数据操作；`onFinish`函数用于表单提交，且使用的是异步执行函数，确保操作成功后关闭页面，并且清空表单数据；`useEffect`内，初始化表单；以下是编辑页面的 JSX 结构：

```react
export const ProjectModal = () => {
  return (
    <Drawer forceRender onClose={close} visible={projectModalOpen} width="100%">
      <Container>
        {isLoading ? (
          <Spin size={"large"} />
        ) : (
          <>
            <h1>{title}</h1>
            <ErrorBox error={error} />
            <Form
              form={form}
              layout={"vertical"}
              style={{ width: "40rem" }}
              onFinish={onFinish}
            >
              <Form.Item
                label="名称"
                key={"name"}
                name={"name"}
                rules={[{ required: true, message: "请输入项目名称" }]}
              >
                <Input placeholder={"请输入项目名"}></Input>
              </Form.Item>
              <Form.Item
                label="部门"
                key={"organization"}
                name={"organization"}
                rules={[{ required: true, message: "请输入部门名称" }]}
              >
                <Input placeholder={"请输入部门名"}></Input>
              </Form.Item>
              <Form.Item label="负责人" key={"person"} name={"personId"}>
                <UserSelect defaultOptionName="负责人"></UserSelect>
              </Form.Item>
              <Form.Item key={"submit"} style={{ textAlign: "right" }}>
                <Button
                  loading={mutateLoading}
                  type={"ghost"}
                  style={{ marginRight: "2rem" }}
                  onClick={close}
                >
                  取消
                </Button>
                <Button
                  loading={mutateLoading}
                  type={"primary"}
                  htmlType={"submit"}
                >
                  提交
                </Button>
              </Form.Item>
            </Form>
          </>
        )}
      </Container>
    </Drawer>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 80vh;
`;
```

### 乐观更新

对于项目的操作，我们在此可引入乐观更新这个概念，也就是可以达到原生应用的效果，进行操作后立即更新UI，然后根据实际服务端返回的数据进行覆盖或者回滚；先拿`useEditProject`下手：

```react
return useMutation(
    (params: Partial<Project>) => {
        return client(`projects/${params.id}`, {
            method: "PATCH",
            data: params,
        });
    },
    {
        onSuccess: () => {
            queryClient.invalidateQueries(queryKey)
        },
        async onMutate(target) {
            // 撤销查询，以免覆盖乐观更新数据
            await queryClient.cancelQueries(queryKey)
            const previousItems = queryClient.getQueryData(queryKey)
            queryClient.setQueryData(queryKey, (old?: Project[]) => {
                return old?.map(project => project.id === target.id ? { ...project, ...target } : project) || []
            })
            // 保留上一次的快照到 context
            return { previousItems }
        },
        onError(error, newItem, context: any) {
            queryClient.setQueryData(queryKey, context.previousItems)
        }
    }
);
```

在`useEditProject`中我们返回了`useMutation`进行数据操作，在其的配置参数中，传入了`onMutate`和`onError`，分别是立即执行和遇到错误后执行；

`onMutate`中，首先撤销了对该 queryKey 的查询，之后根据当前操作的数据对原数据进行处理，最后返回将原数据保存到上下文中；

若请求数据过程出现错误，会回调`onError`，将上下文中保存的原数据进行回滚；

不过这样的写法，只是针对`useEditProject`单独做了乐观更新，完全耦合在一起的，我们也可以抽离出一个独立的工具，因为是通用方法，所以避免类型过于复杂，直接使用 Any 大法：

```react
export const useConfig = (
  queryKey: QueryKey,
  callback: (target: any, old?: any[]) => any[]
) => {
  const queryClient = useQueryClient();
  return {
    onSuccess: () => {
      queryClient.invalidateQueries(queryKey);
    },
    async onMutate(target: any) {
      await queryClient.cancelQueries(queryKey);
      const previousItems = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old?: any[]) => {
        return callback(target, old);
      });
      return { previousItems };
    },
    onError(error: any, newItem: any, context: any) {
      queryClient.setQueryData(queryKey, context.previousItems);
    },
  };
};

// 根据 useConfig 可编写其他的 Hook...
export const useDeleteConfig = (queryKey: QueryKey) =>
  useConfig(
    queryKey,
    (target, old) => old?.filter((item) => item.id !== target.id) || []
  );
```

这样一来，`useEditProject`则直接添加一个`queryKey`参数即可根据外部状态进行查询操作了：

```react
export const useEditProject = (queryKey: QueryKey) => {
    const client = useHttp();
    return useMutation(
        (params: Partial<Project>) => {
            return client(`projects/${params.id}`, {
                method: "PATCH",
                data: params,
            });
        },
        useEditConfig(queryKey)
    );
};
```

### 删除项目

做了上述工作后，我们可以将编辑项目和删除项目的 popMenu 单独抽成一个组件：

```react
const More = ({ project }: { project: Project }) => {
  const { startEdit } = useProjectModal();
  const editProject = (id: number) => () => startEdit(id);
  const { mutate: delProject } = useDeleteProject(useProjectQueryKey());
  const confirmDeleteProject = (dProject: Project) => {
    Modal.confirm({
      title: `确认要删除项目 ${dProject.name} 吗？`,
      content: "点击确认删除",
      okText: "删除",
      onOk() {
        delProject(dProject);
      },
    });
  };
  return (
    <Dropdown
      overlay={
        <Menu>
          <Menu.Item onClick={editProject(project.id)} key={"edit"}>
            编辑
          </Menu.Item>
          <Menu.Item
            onClick={() => confirmDeleteProject(project)}
            key={"delete"}
          >
            删除
          </Menu.Item>
        </Menu>
      }
    >
      <ButtonNoPadding type={"link"}>...</ButtonNoPadding>
    </Dropdown>
  );
};
```

### Bug 修复

1. 编辑项目后，表单内容未清除，编写一个关闭函数，内部清除表单：

   ```react
   const closeModal = () =>{
       form.resetFields()
       close()
   }
   ```

2. 打开编辑项目Modal时，需要等待异步获取待编辑项目数据，而不是进入Loading，修改判断条件：

   ```react
   projectModalOpen: projectCreate === "true" || Boolean(editingProjectId),
   ```

3. 在当前用户退出登录，其他用户登录时，也跳闪缓存的数据，在登出时对缓存数据进行清除：

   ```react
   const logout = () =>
   auth.logout().then(() => {
       queryClient.clear(); 
       setUser(null);
   });
   ```

## 看板列表开发

引入部分 svg 会报错，这是因为在 JSX 中属性需要使用驼峰格式，可最快速的方法是使用工具替换：

> SyntaxError: unknown: Namespace tags are not supported by default. React's JSX doesn't support namespace tags. You can set `throwIfNamespace: false` to bypass this warning.

+ [SVG Minifier (svgminify.com)](https://www.svgminify.com/)

### 搜索关键字高亮

```react
const Mark = ({ keyword, name }: { name: string; keyword: string }) => {
    if (!keyword) return <>{name}</>;
    const arr = name.split(keyword);
    return (
        <>
        {arr.map((str, index) => (
        <span key={index}>
            {str}
            {index === arr.length - 1 ? null : (
                <span style={{ color: "#257AFD" }}>{keyword}</span>
            )}
        </span>
    ))}
</>
);
};
```

### 拖拽实现

过于复杂，且不常用，使用第三包`react-beautiful-dnd`实现；

### 排序乐观更新

## 代码测试



