import ResultModel from './ResultModel'
import BatchModel from './BatchModel'
import QueryModel from './QueryModel'
import path from 'path'
import defaultValues  from '../util/default-values'

export default class RunModel extends ResultModel {
  mapJsonFile (json) {
    // Load generic field with parent method
    super.mapJsonFile(json)

    this.inputFile = json.input_file
    this.batchFile = json.batch_file
    this.queryFiles = json.query_files

    // Optional fields
    if (json.warnings) {
      this.warnings = json.warnings
    } else {
      this.warnings = null
    }

    if (json.error_msg) {
      this.errorMsg = json.error_msg
    } else {
      this.errorMsg = null
    }
  }

  loadRelations () {
    this.batch = new BatchModel(this.batchFile, false)
    this.queries = this.queryFiles.map(queryFile =>
                                         new QueryModel(queryFile, false))
  }

  loadQueries (updateListener = false) {
    this.queries = this.queryFiles.map(
      queryFile => new QueryModel(queryFile, false, updateListener)
    )
  }

  loadBatch () {
    this.batch = new BatchModel(this.batchFile, false)
  }

  title () {
    return this.inputFileName().replace(/\.dps$/ui, '')
  }

  getIpcId () {
    return this.batchFile
  }

  /**
   * Get the maximum memory used by OCaml during the running time of this run.
   *
   * @returns {Number} The maximum memory in Byte.
   */
  maxMemoryUsed () {
    return this.queries.reduce((sum, q) => Math.max(sum, q.maxMemory), 0)
  }

  progressionPercent () {
    if (this.isCompleted()) {
      return 100
    }

    if (this.status === 'waiting') {
      return 0
    }

    const queriesProgression = this.queries.reduce(
      (sum, q) => sum + q.absoluteProgressionPercent(), 0)

    return Math.floor(queriesProgression / this.nbQueries())
  }

  inputFileName () {
    return path.basename(this.inputFile)
  }

  nbQueries () {
    return this.queryFiles.length
  }

  nbQueriesCompleted () {
    return this.queries.filter(q => q.isCompleted()).length
  }

  /**
   * @returns {String} Input (spec) file absolute paths
   */
  inputFileAbsolutePath () {
    return path.join(String(defaultValues['resultsDirPath']), this.inputFile)
  }
}
