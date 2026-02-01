***
title: "Syntax Patterns"
version: "1.0"
last_updated: "2026-01-24"
status: "Draft"
author: "Antigravity Agent"
related_docs:
  - "docs/Technical-Documentation/Development-Standards-Document.md"
  - "docs/Technical-Documentation/Implementation-Plan.md"
priority: "P1"
estimated_implementation_time: "N/A (Standards)"
***

# ملفات الصيغ القياسية (Syntax Patterns)

## الهدف
تثبيت الصيغ الصحيحة المتكررة لتوحيد أسلوب كتابة الكود والقراءة السريعة.

## Backend (NestJS)
### Controller Pattern
```typescript
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.tasksService.getById(id);
  }

  @Post()
  create(@Body() dto: CreateTaskDto) {
    return this.tasksService.create(dto);
  }
}
```

### Service Pattern
```typescript
import { Injectable } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';

@Injectable()
export class TasksService {
  getById(id: string) {
    return { id };
  }

  create(dto: CreateTaskDto) {
    return dto;
  }
}
```

## Frontend (React + Vite)
### Component Pattern
```tsx
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface ComponentProps {
  title: string;
  icon?: LucideIcon;
  className?: string;
  onClick?: () => void;
}

export function ComponentName({ title, icon: Icon, className, onClick }: ComponentProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 p-4 rounded-lg border bg-card text-card-foreground shadow-sm",
        "hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {Icon && <Icon className="w-5 h-5" />}
      <h3 className="font-medium">{title}</h3>
    </div>
  );
}
```

### React Query Pattern
```tsx
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Task } from '@/types';

export function useTasks(workspaceId: string) {
  return useQuery({
    queryKey: ['tasks', workspaceId],
    queryFn: async () => {
      const { data } = await api.get<Task[]>(`/workspaces/${workspaceId}/tasks`);
      return data;
    },
    enabled: !!workspaceId
  });
}
```

## Automation (n8n)
### Webhook Trigger Pattern
```json
{
  "nodes": [
    {
      "parameters": {
        "path": "tasks-hook",
        "httpMethod": "POST",
        "responseMode": "lastNode"
      },
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [200, 300]
    }
  ]
}
```
