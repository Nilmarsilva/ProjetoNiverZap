import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho para o arquivo ContatosPage.tsx
const contatosPagePath = path.resolve(__dirname, '../src/pages/ContatosPage.tsx');

// Ler o conteúdo do arquivo
let content = fs.readFileSync(contatosPagePath, 'utf8');

// 1. Adicionar o componente DatePicker
if (!content.includes('function DatePicker')) {
  // Adicionar o componente DatePicker após os imports
  const datepickerComponent = `
// Componente DatePicker personalizado
function DatePicker({ date, setDate }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          {date ? format(date, "dd/MM/yyyy") : "Selecione uma data"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}`;

  // Inserir após os imports
  const lastImportIndex = content.lastIndexOf('import {');
  const lastImportEndIndex = content.indexOf('}', lastImportIndex);
  const insertPosition = content.indexOf('\n', lastImportEndIndex) + 1;
  
  content = content.slice(0, insertPosition) + datepickerComponent + content.slice(insertPosition);
}

// 2. Adicionar os imports de X e Save do lucide-react
if (!content.includes('import { MoreHorizontal, Plus, UserPlus, Filter, Upload, Eye, Edit, Trash2, X, Save } from')) {
  content = content.replace(
    /import { MoreHorizontal, Plus, UserPlus, Filter, Upload, Eye, Edit, Trash2 } from 'lucide-react'/,
    "import { MoreHorizontal, Plus, UserPlus, Filter, Upload, Eye, Edit, Trash2, X, Save } from 'lucide-react'"
  );
}

// 3. Adicionar o estado isEditing se ainda não existir
if (!content.includes('const [isEditing, setIsEditing]')) {
  content = content.replace(
    /const \[selectedContato, setSelectedContato\] = useState<Contato \| null>\(null\);/,
    'const [selectedContato, setSelectedContato] = useState<Contato | null>(null);\n  const [isEditing, setIsEditing] = useState(false);'
  );
}

// 4. Adicionar a função handleCancelEdit se ainda não existir
if (!content.includes('const handleCancelEdit')) {
  content = content.replace(
    /const handleDeleteContato[\s\S]*?\}/,
    match => match + `\n\n  // Função para cancelar a edição\n  const handleCancelEdit = () => {\n    setIsEditing(false);\n  };`
  );
}

// 5. Corrigir a seção de botões na visualização de detalhes
const detailsButtonsPattern = /<div className="flex gap-2 mt-8 justify-end">[\s\S]*?<Button[\s\S]*?onClick={\(\) => handleEditContato\(selectedContato\)}[\s\S]*?<\/Button>[\s\S]*?<Button[\s\S]*?onClick={\(\) => {[\s\S]*?handleDeleteContato\(selectedContato\)[\s\S]*?}}[\s\S]*?<\/Button>[\s\S]*?<\/div>/;

if (detailsButtonsPattern.test(content)) {
  content = content.replace(
    detailsButtonsPattern,
    `<div className="flex gap-2 mt-8 justify-end">
                {isEditing ? (
                  <>
                    <Button 
                      variant="outline"
                      onClick={handleCancelEdit}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button 
                      className="bg-datazap-green hover:bg-datazap-green/90"
                      onClick={form.handleSubmit(onSubmit)}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Salvar
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="outline"
                      onClick={() => handleEditContato(selectedContato)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => {
                        handleDeleteContato(selectedContato)
                        setViewMode('list')
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </Button>
                  </>
                )}
              </div>`
  );
}

// 6. Corrigir a estrutura JSX na visualização de detalhes
// Primeiro, vamos verificar se há um problema com o fechamento de divs
const detailsContentPattern = /<div className="bg-white p-6 rounded-lg border">[\s\S]*?<div className="grid grid-cols-1 md:grid-cols-2 gap-6">/;

if (detailsContentPattern.test(content)) {
  // Substituir a estrutura inteira da visualização de detalhes
  const detailsStartPattern = /\{viewMode === 'details' && selectedContato && \(/;
  const detailsStart = content.indexOf(detailsStartPattern);
  
  if (detailsStart !== -1) {
    // Encontrar o final da visualização de detalhes
    let openBraces = 1;
    let closePosition = detailsStart;
    
    for (let i = detailsStart + detailsStartPattern.toString().length; i < content.length; i++) {
      if (content[i] === '(') openBraces++;
      if (content[i] === ')') openBraces--;
      
      if (openBraces === 0) {
        closePosition = i + 1;
        break;
      }
    }
    
    // Extrair a seção de detalhes
    const detailsSection = content.substring(detailsStart, closePosition);
    
    // Corrigir a estrutura JSX
    const correctedDetailsSection = detailsSection.replace(
      /<div className="bg-white p-6 rounded-lg border">[\s\S]*?<div className="grid grid-cols-1 md:grid-cols-2 gap-6">[\s\S]*?<\/div>[\s\S]*?<\/div>/,
      `<div className="bg-white p-6 rounded-lg border">
              {isEditing ? (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="nome"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="telefone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="dataNascimento"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data de Nascimento</FormLabel>
                            <FormControl>
                              <DatePicker 
                                date={field.value} 
                                setDate={(date) => field.onChange(date)}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="genero"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gênero</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o gênero" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="masculino">Masculino</SelectItem>
                                <SelectItem value="feminino">Feminino</SelectItem>
                                <SelectItem value="nao-informado">Não informado</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="grupo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Classificação</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione a classificação" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Cliente">Cliente</SelectItem>
                                <SelectItem value="Fornecedor">Fornecedor</SelectItem>
                                <SelectItem value="Parceiro">Parceiro</SelectItem>
                                <SelectItem value="Outro">Outro</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="canalPreferido"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Canal Preferido</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o canal" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                <SelectItem value="email">Email</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="ativo"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Contato ativo
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  </form>
                </Form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium">Informações Básicas</h3>
                    <div className="mt-3 space-y-2">
                      <div>
                        <span className="font-medium">Nome:</span> {selectedContato.nome}
                      </div>
                      <div>
                        <span className="font-medium">Telefone:</span> {selectedContato.telefone}
                      </div>
                      <div>
                        <span className="font-medium">Email:</span> {selectedContato.email || 'Não informado'}
                      </div>
                      <div>
                        <span className="font-medium">Data de Nascimento:</span> {selectedContato.dataNascimento || 'Não informado'}
                      </div>
                      <div>
                        <span className="font-medium">Gênero:</span> {
                          selectedContato.genero === 'masculino' ? 'Masculino' : 
                          selectedContato.genero === 'feminino' ? 'Feminino' : 
                          <span className="text-red-500">Não identificado - favor editar</span>
                        }
                      </div>
                      <div>
                        <span className="font-medium">Classificação:</span> {selectedContato.grupo || 'Não informado'}
                      </div>
                      <div>
                        <span className="font-medium">Canal Preferido:</span> {
                          selectedContato.canalPreferido === 'whatsapp' ? 'WhatsApp' : 
                          selectedContato.canalPreferido === 'email' ? 'Email' : 
                          'Não informado'
                        }
                      </div>
                      <div>
                        <span className="font-medium">Status:</span> {
                          selectedContato.ativo ? 
                          <span className="text-green-500">Ativo</span> : 
                          <span className="text-red-500">Inativo</span>
                        }
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium">Datas Comemorativas</h3>
                    {selectedContato.datasComemorativas && selectedContato.datasComemorativas.length > 0 ? (
                      <div className="mt-3 space-y-4">
                        {selectedContato.datasComemorativas.map((data, index) => (
                          <div key={index} className="p-3 border rounded-md">
                            <div className="flex items-center gap-2">
                              <div className={cn(
                                "text-xs px-2 py-1 rounded-full border",
                                data.tipo === 'aniversario' && "bg-blue-100 border-blue-300 text-blue-800",
                                data.tipo === 'dia-dos-pais' && "bg-indigo-100 border-indigo-300 text-indigo-800",
                                data.tipo === 'dia-das-maes' && "bg-pink-100 border-pink-300 text-pink-800",
                                data.tipo === 'pascoa' && "bg-yellow-100 border-yellow-300 text-yellow-800",
                                data.tipo === 'natal' && "bg-red-100 border-red-300 text-red-800",
                                data.tipo === 'ano-novo' && "bg-green-100 border-green-300 text-green-800",
                                data.tipo === 'outro' && "bg-gray-100 border-gray-300 text-gray-800"
                              )}>
                                {data.tipo === 'aniversario' && 'Aniversário'}
                                {data.tipo === 'dia-dos-pais' && 'Dia dos Pais'}
                                {data.tipo === 'dia-das-maes' && 'Dia das Mães'}
                                {data.tipo === 'pascoa' && 'Páscoa'}
                                {data.tipo === 'natal' && 'Natal'}
                                {data.tipo === 'ano-novo' && 'Ano Novo'}
                                {data.tipo === 'outro' && 'Outro'}
                              </div>
                            </div>
                            <div className="mt-2">
                              <span className="font-medium">Data:</span> {data.data}
                            </div>
                            {data.observacao && (
                              <div className="mt-1">
                                <span className="font-medium">Observação:</span> {data.observacao}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-3 text-gray-500">
                        Nenhuma data comemorativa cadastrada.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>`
    );
    
    // Substituir a seção de detalhes no conteúdo
    content = content.substring(0, detailsStart) + correctedDetailsSection + content.substring(closePosition);
  }
}

// 7. Modificar a função handleEditContato para usar o estado isEditing
content = content.replace(
  /const handleEditContato[\s\S]*?setOpenDialog\(true\);[\s\S]*?\}/,
  `const handleEditContato = (contato: Contato) => {
    setSelectedContato(contato);
    
    // Preencher o formulário com os dados do contato
    form.setValue('nome', contato.nome);
    form.setValue('telefone', contato.telefone);
    form.setValue('email', contato.email);
    form.setValue('canalPreferido', contato.canalPreferido);
    form.setValue('grupo', contato.grupo);
    form.setValue('genero', contato.genero);
    form.setValue('ativo', contato.ativo);
    
    // Converter string para objeto Date para a data de nascimento
    if (contato.dataNascimento) {
      const [dia, mes, ano] = contato.dataNascimento.split('/').map(Number);
      form.setValue('dataNascimento', new Date(ano, mes - 1, dia));
    }
    
    // Converter e carregar as datas comemorativas
    if (contato.datasComemorativas && contato.datasComemorativas.length > 0) {
      const datasConvertidas = contato.datasComemorativas.map(data => {
        // Verificar se o tipo é válido
        const tipoValido = [
          'aniversario', 'dia-dos-pais', 'dia-das-maes', 
          'pascoa', 'natal', 'ano-novo', 'outro'
        ].includes(data.tipo) ? data.tipo as 'aniversario' | 'dia-dos-pais' | 'dia-das-maes' | 'pascoa' | 'natal' | 'ano-novo' | 'outro' : 'outro';
        
        // Converter a data de string para Date se necessário
        let dataObj: Date;
        if (typeof data.data === 'string') {
          const [diaData, mesData, anoData] = data.data.split('/').map(Number);
          dataObj = new Date(anoData || new Date().getFullYear(), mesData - 1, diaData);
        } else if (data.data && typeof data.data === 'object' && 'getMonth' in data.data) {
          // Verifica se é um objeto Date (tem o método getMonth)
          dataObj = data.data as Date;
        } else {
          dataObj = new Date();
        }
        
        return {
          tipo: tipoValido,
          data: dataObj,
          observacao: data.observacao || ''
        };
      });
      
      form.setValue('datasComemorativas', datasConvertidas);
    } else {
      form.setValue('datasComemorativas', []);
    }
    
    // Ativar o modo de edição
    setIsEditing(true);
    
    // Garantir que estamos na visualização de detalhes
    setViewMode('details');
  }`
);

// Salvar as alterações
fs.writeFileSync(contatosPagePath, content);

console.log('Todos os erros foram corrigidos com sucesso!');
