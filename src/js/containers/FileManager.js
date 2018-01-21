import {connect} from 'react-redux';
import _FileManager from '../components/FileManager';
import {TestData, createFolderChain} from '../lib/TestData';

const mapStateToProps = state => {
	return {
		shownFolders: createFolderChain(TestData, state.filePath),
	}
}

const mapDispatchToProps = dispatch => {
	return {

	}
}

const FileManager = connect(
	mapStateToProps,
	mapDispatchToProps
)(_FileManager);

export default FileManager;