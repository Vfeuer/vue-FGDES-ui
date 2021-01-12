<template>
  <div>
    <!-- breadcrumb Navigation for several nodes-->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">Center</el-breadcrumb-item>
      <el-breadcrumb-item>Node Status</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- Card to show imformation and data from nodes-->
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <el-row>
          <el-col :span="10">Center of node status</el-col>
          <el-col :span="6" :offset="8">
            <!-- <el-button type="primary" plain @click="getNodeStatusList">refresh</el-button> -->
          </el-col>
        </el-row>
      </div>

      <!-- Table to show the details of nodes-->
      <template>
        <el-table :data="NodeStatusList"
                  border
                  stripe
                  style="width: 100%">
          <el-table-column type="index"
                           label="#">
          </el-table-column>
          <el-table-column prop="nodeName"
                           label="name">
          </el-table-column>
          <el-table-column prop="CurrentValue"
                           sortable
                           label="current value/A">
          </el-table-column>
          <el-table-column prop="maxCurrent"
                           sortable
                           label="max current /A">
          </el-table-column>
          <el-table-column prop="workmode"
                           sortable
                           label="workmode">
          </el-table-column>
          <el-table-column label="status">
            <template slot-scope="scope">
              <el-switch v-model="scope.row.workStatus"
                         @change="changeNodeStatus(scope.row)"
                         :active-value= "1"
                         :inactive-value= "0"
                         inactive-color= "#E6A23C">
              </el-switch>
            </template>
          </el-table-column>
          <el-table-column label="edit">
            <template slot-scope="scope">

              <!-- edit node name-->
              <el-tooltip effect="dark" content="rename" placement="top">
                <el-button type="primary"
                           icon="el-icon-edit"
                           size="mini"
                           circle
                           @click="showNameDialog(scope.row.id)">
                </el-button>
              </el-tooltip>

              <!-- settings of node-->
              <el-tooltip effect="dark" content="setting" placement="top">
                <el-button type="warning"
                           icon="el-icon-setting"
                           size="mini"
                           circle
                           @click="showSettingDialog(scope.row.id)">
                </el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>

        <!-- Pagination of table-->
        <el-pagination @size-change="handleSizeChange"
                       @current-change="handleCurrentChange"
                       :current-page="queryInfo.pagenum"
                       :page-sizes="[5,10,15,20,40]"
                       :page-size="queryInfo.pagesize"
                       layout="total, sizes, prev, pager, next"
                       :total="total">
        </el-pagination>
      </template>
    </el-card>

    <!-- Messagebox for changing the name of nodes-->
    <el-dialog title="edit node name"
               :visible.sync="NameDialogVisible"
               width="350px"
               class="NameDialog"
               @close="nameDialogClosed">
      <el-form :model="nameForm" :rules="nameFormRules" ref="nameFormRef" label-width="150px">
        <el-form-item label="node name" prop="nodeName">
          <el-input v-model="nameForm.nodeName" disabled></el-input>
        </el-form-item>
        <el-form-item label="new node name" prop="newName">
          <el-input v-model="nameForm.newName"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="NameDialogVisible = false">cancel</el-button>
        <el-button type="primary" @click="NameDialogConfirm">save</el-button>
      </span>
    </el-dialog>

    <!-- Messagebox for changing the settings of nodes-->
    <el-dialog title="settings of nodes"
               :visible.sync="settingDialogVisible"
               width="300px"
               class="settingDialog"
               @close="settingDialogClosed">
      <el-form :model="settingForm" :rules="settingFormRules" ref="settingFormRef" label-width="100px" class="settingform">
        <el-form-item label="max current" prop="maxCurrent">
          <el-input v-model.number="settingForm.maxCurrent">
            <template slot="append"><div style="width:0px">A</div></template>
          </el-input>
        </el-form-item>
        <el-form-item label="workmode">
            <el-radio-group v-model="settingForm.workmode" size="small">
              <el-radio :label="'normal'">normal</el-radio>
              <el-radio :label="'fast'">fast</el-radio>
            </el-radio-group>
          </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="settingDialogVisible = false">cancel</el-button>
        <el-button type="primary" @click="settingDialogConfirm">save</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    var checkCurrentValue = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('The value of max current cannot be empty'))
      }
      setTimeout(() => {
        if (!Number.isInteger(value)) {
          callback(new Error('please enter only numbers'))
        } else {
          if (value > this.safeCurrent) {
            callback(new Error('max current should be less than the safe current ' + this.safeCurrent + ' A'))
          } else {
            callback()
          }
        }
      }, 150)
    }
    return {
      queryInfo: {
        query: '',
        // current page
        pagenum: 1,
        // number of nodes in the table
        pagesize: 10
      },
      safeCurrent: 32,
      NodeStatusList: [],
      total: 0,
      nodeInfo: {},
      NameDialogVisible: false, // if the messagebox of changing name is visible
      nameForm: {},
      nameFormRules: {
        newName: [
          { required: true, message: 'please enter the new name of Node', trigger: 'blur' },
          {
            max: 20,
            message: 'Length of the node name should be less than 20 letters',
            trigger: 'blur'
          }]
      },
      settingDialogVisible: false, // if the messagebox of edit settings of node is visible
      settingForm: {},
      settingFormRules: {
        maxCurrent: [
          { validator: checkCurrentValue, trigger: 'blur' }]
      }
    }
  },
  created () {
    this.getNodeStatusList()
    this.keepAlive()
  },
  methods: {
    // get the informationslist of mesh
    async getNodeStatusList () {
      const { data: res } = await this.$http.get('nodes/status')
      if (res.meta.status !== 200) {
        return this.$message.error('Failed to receive the data of nodes')
      }
      this.NodeStatusList = res.data
      this.total = res.data.length
      this.getMeshSetting()
    },

    // change the size of pages
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getNodeStatusList()
    },
    // change the current page
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getNodeStatusList()
    },

    // to change the work status of node, whether work or stop
    async changeNodeStatus (nodeInfo) {
      const { data: res } = await this.$http.put('nodes/status',
        {
          id: nodeInfo.id,
          maxCurrent: nodeInfo.maxCurrent,
          workmode: nodeInfo.workmode,
          workStatus: nodeInfo.workStatus
        })
      if (res.meta.status !== 202) {
        nodeInfo.workStatus = !nodeInfo.workStatus
        return this.$message.error('failes in changing the status of node')
      }
      this.$message.success('success in changing the status of node')
    },

    // show the dialog for changing the name of node
    async showNameDialog (id) {
      const { data: res } = await this.$http.get('nodes/list?id=' + id)
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('Failed to read the information of node')
      }
      this.nameForm = res.data
      this.NameDialogVisible = true
    },

    // reset the Form when closed without confirmation
    nameDialogClosed () {
      this.$refs.nameFormRef.resetFields()
    },

    // edit the name of node then upload
    NameDialogConfirm () {
      this.$refs.nameFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put('nodes/list',
          { id: this.nameForm.id, newName: this.nameForm.newName })
        if (res.meta.status !== 202) {
          this.$message.error('fail to change the name of node！')
        }
        this.NameDialogVisible = false
        this.$message.success('The name of the node has been successfully modified！')
        this.getNodeStatusList()
      })
    },

    // show the dialog for editing the settings of node
    async showSettingDialog (id) {
      const { data: res } = await this.$http.get('nodes/status?id=' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('Failed to read the information of node')
      }
      this.settingForm = res.data
      this.settingDialogVisible = true
    },

    // reset the Form when closed without confirmation
    settingDialogClosed () {
      this.$refs.settingFormRef.resetFields()
    },
    settingDialogConfirm () { // edit the settings of node then upload
      this.$refs.settingFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put('nodes/status',
          {
            id: this.settingForm.id,
            maxCurrent: this.settingForm.maxCurrent,
            workmode: this.settingForm.workmode,
            workStatus: this.settingForm.workStatus
          })
        if (res.meta.status !== 202) {
          this.$message.error('fail to change the settings of node！')
        }
        this.settingDialogVisible = false
        this.$message.success('The settings of the node has been successfully modified！')
        this.getNodeStatusList()
      })
    },
    keepAlive () {
      setInterval(() => {
        this.getNodeStatusList()
      }, 3000)
    },
    async getMeshSetting () {
      const { data: res } = await this.$http.get('mesh/setting')
      if (res.meta.status !== 200) {
        return this.$message.error('Failed to read the setting of mesh')
      }
      this.safeCurrent = res.data.safeMax
    }
  }
}
</script>

<style lang="less" scoped>
  .text {
    font-size: 14px;
  }
  .item {
    margin-bottom: 18px;
  }
  .clearfix:before,
  .clearfix:after {
    display: table;
    content: "";
  }
  .clearfix:after {
    clear: both
  }
  .box-card {
    width: 95%;
  }
  .clearfix /deep/ .el-button{
    float:right;
  }
  .el-row {
    display: flex;
    align-items: center;
  }
  .el-pagination{
    margin-top:12px;
  }
</style>
<style>
  .box-card /deep/ .el-card__header {
    padding: 10px 12px;
  }
  .box-card /deep/ .el-card__body {
    padding: 0px 10px;
  }
  .NameDialog /deep/ .el-dialog__footer{
    padding:15px;
  }
  .NameDialog /deep/ .el-dialog__body {
    padding: 25px 20px;
  }
  .NameDialog /deep/ .el-dialog__header {
    padding: 15px 20px;
  }
  .settingDialog /deep/ .el-dialog__body {
    padding: 20px 15px;
    padding-bottom: 0px;
  }
  .NameDialog /deep/ .el-form-item__error {
    text-align: justify;
  }
</style>
